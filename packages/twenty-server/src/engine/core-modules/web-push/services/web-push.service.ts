import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import groupBy from 'lodash.groupby';
import { FOCUSED_TAB_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, MoreThan, Not } from 'typeorm';
import { generateRequestDetails } from 'web-push';

import { UPDATE_OWNED_KEY_LEASE_SCRIPT } from 'src/engine/core-modules/cache-storage/constants/update-owned-key-lease-script.constant';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { type UpsertWebPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-web-push-subscription.input';
import { WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';
import { type WebPushNotification } from 'src/engine/core-modules/web-push/types/web-push-notification.type';
import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';
import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';
import {
  WebPushException,
  WebPushExceptionCode,
} from 'src/engine/core-modules/web-push/web-push.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const FOCUSED_TAB_TTL_MS = FOCUSED_TAB_HEARTBEAT_INTERVAL_MS * 2;
const WEB_PUSH_SERVICE_MESSAGE_TTL_SECONDS = 3600;
const EXPIRED_WEB_PUSH_SUBSCRIPTION_STATUS_CODES = [404, 410];

const getFocusedTabKey = (workspaceId: string, workspaceMemberId: string) =>
  `focused-tab:${workspaceId}:${workspaceMemberId}`;

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WebPushSubscriptionEntity)
    private readonly webPushSubscriptionRepository: WorkspaceScopedRepository<WebPushSubscriptionEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userSessionService: UserSessionService,
  ) {}

  async upsertWebPushSubscription({
    input,
    workspaceId,
    userWorkspaceId,
    sessionToken,
  }: {
    input: UpsertWebPushSubscriptionInput;
    workspaceId: string;
    userWorkspaceId: string;
    sessionToken: string | undefined;
  }): Promise<void> {
    if (!isWebPushEndpointAllowed(input.endpoint)) {
      throw new WebPushException(
        'Web push subscription endpoint is not on an allowed push service',
        WebPushExceptionCode.ENDPOINT_NOT_ALLOWED,
      );
    }

    const { publicKey } = deriveWebPushVapidKeyPair({
      twentyConfigService: this.twentyConfigService,
    });

    if (input.vapidPublicKey !== publicKey) {
      throw new WebPushException(
        'Web push subscription was created with an unknown VAPID public key',
        WebPushExceptionCode.UNKNOWN_VAPID_PUBLIC_KEY,
      );
    }

    const session = isNonEmptyString(sessionToken)
      ? await this.userSessionService.findActiveSessionByToken(sessionToken)
      : null;

    if (!isDefined(session) || session.userWorkspaceId !== userWorkspaceId) {
      throw new WebPushException(
        'Web push subscription request has no active session for this user workspace',
        WebPushExceptionCode.ACTIVE_SESSION_NOT_FOUND,
      );
    }

    await this.webPushSubscriptionRepository.delete(workspaceId, {
      userSessionId: session.id,
      endpoint: Not(input.endpoint),
    });

    await this.webPushSubscriptionRepository.upsert(
      workspaceId,
      {
        endpoint: input.endpoint,
        browserPublicKey: input.browserPublicKey,
        browserAuthSecret: input.browserAuthSecret,
        vapidPublicKey: input.vapidPublicKey,
        userSessionId: session.id,
      },
      ['workspaceId', 'endpoint'],
    );
  }

  async updateFocusedTab({
    workspaceId,
    workspaceMemberId,
    tabId,
    isFocused,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    tabId: string;
    isFocused: boolean;
  }): Promise<void> {
    const focusedTabKey = getFocusedTabKey(workspaceId, workspaceMemberId);

    if (isFocused) {
      await this.cacheStorageService.set(
        focusedTabKey,
        tabId,
        FOCUSED_TAB_TTL_MS,
      );

      return;
    }

    await this.cacheStorageService.runScript<number>({
      script: UPDATE_OWNED_KEY_LEASE_SCRIPT,
      keys: [focusedTabKey],
      args: [JSON.stringify(tabId), '0'],
    });
  }

  async findWorkspaceMemberIdsWithFocusedTab({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<Set<string>> {
    if (workspaceMemberIds.length === 0) {
      return new Set();
    }

    const focusedTabIds = await this.cacheStorageService.mget<string>(
      workspaceMemberIds.map((workspaceMemberId) =>
        getFocusedTabKey(workspaceId, workspaceMemberId),
      ),
    );

    return new Set(
      workspaceMemberIds.filter((_, index) => isDefined(focusedTabIds[index])),
    );
  }

  async findWebPushSubscriptionsByUserId({
    workspaceId,
    userIds,
  }: {
    workspaceId: string;
    userIds: string[];
  }): Promise<Partial<Record<string, WebPushSubscriptionEntity[]>>> {
    if (userIds.length === 0) {
      return {};
    }

    const webPushSubscriptions = await this.webPushSubscriptionRepository.find(
      workspaceId,
      {
        where: {
          vapidPublicKey: deriveWebPushVapidKeyPair({
            twentyConfigService: this.twentyConfigService,
          }).publicKey,
          userSession: {
            revokedAt: IsNull(),
            expiresAt: MoreThan(new Date()),
            userId: In(userIds),
            workspaceId,
          },
        },
        relations: { userSession: true },
      },
    );

    return groupBy(
      webPushSubscriptions,
      (webPushSubscription) => webPushSubscription.userSession.userId,
    );
  }

  async sendNotification({
    workspaceId,
    userId,
    webPushSubscriptions,
    notification,
  }: {
    workspaceId: string;
    userId: string;
    webPushSubscriptions: WebPushSubscriptionEntity[];
    notification: WebPushNotification;
  }): Promise<void> {
    const vapidKeyPair = deriveWebPushVapidKeyPair({
      twentyConfigService: this.twentyConfigService,
    });
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const subject = serverUrl.startsWith('https:')
      ? serverUrl
      : `mailto:${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}`;
    const httpClient = this.secureHttpClientService.getHttpClient(
      { maxRedirects: 0 },
      { workspaceId, source: 'web-push', userId },
    );

    const webPushSubscriptionIdsToDelete: string[] = [];

    for (const webPushSubscription of webPushSubscriptions) {
      if (!isWebPushEndpointAllowed(webPushSubscription.endpoint)) {
        webPushSubscriptionIdsToDelete.push(webPushSubscription.id);

        continue;
      }

      try {
        const { endpoint, headers, body } = generateRequestDetails(
          {
            endpoint: webPushSubscription.endpoint,
            keys: {
              p256dh: webPushSubscription.browserPublicKey,
              auth: webPushSubscription.browserAuthSecret,
            },
          },
          JSON.stringify(notification),
          {
            vapidDetails: { subject, ...vapidKeyPair },
            TTL: WEB_PUSH_SERVICE_MESSAGE_TTL_SECONDS,
            urgency: 'high',
          },
        );

        const response = await httpClient.post(endpoint, body, {
          headers,
          validateStatus: () => true,
        });

        if (
          EXPIRED_WEB_PUSH_SUBSCRIPTION_STATUS_CODES.includes(response.status)
        ) {
          webPushSubscriptionIdsToDelete.push(webPushSubscription.id);
        } else if (response.status >= 300) {
          this.logger.warn(
            `Push service answered ${response.status} for web push subscription ${webPushSubscription.id} in workspace ${workspaceId}`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Could not send to web push subscription ${webPushSubscription.id} in workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (webPushSubscriptionIdsToDelete.length > 0) {
      await this.webPushSubscriptionRepository.delete(workspaceId, {
        id: In(webPushSubscriptionIdsToDelete),
      });
    }
  }
}
