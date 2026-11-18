import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, Not } from 'typeorm';
import { generateRequestDetails } from 'web-push';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { type UpsertPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-push-subscription.input';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';
import { type WebPushNotification } from 'src/engine/core-modules/web-push/types/web-push-notification.type';
import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';
import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const FOCUSED_TAB_TTL_MS = 45_000;
const PUSH_SERVICE_MESSAGE_TTL_SECONDS = 3600;
const EXPIRED_PUSH_SUBSCRIPTION_STATUS_CODES = [404, 410];

const getFocusedTabKey = (workspaceId: string, userId: string) =>
  `focused-tab:${workspaceId}:${userId}`;

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    @InjectWorkspaceScopedRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: WorkspaceScopedRepository<PushSubscriptionEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userSessionService: UserSessionService,
  ) {}

  async upsertPushSubscription({
    input,
    workspaceId,
    userWorkspaceId,
    sessionToken,
  }: {
    input: UpsertPushSubscriptionInput;
    workspaceId: string;
    userWorkspaceId: string;
    sessionToken: string | undefined;
  }): Promise<void> {
    if (!isWebPushEndpointAllowed(input.endpoint)) {
      throw new UserInputError(
        'Push subscription endpoint is not on an allowed push service',
      );
    }

    const { publicKey } = deriveWebPushVapidKeyPair({
      twentyConfigService: this.twentyConfigService,
    });

    if (input.applicationServerKey !== publicKey) {
      throw new UserInputError(
        'Push subscription was created with an unknown application server key',
      );
    }

    const session = isNonEmptyString(sessionToken)
      ? await this.userSessionService.findSessionByToken(sessionToken)
      : null;

    if (!isDefined(session) || session.userWorkspaceId !== userWorkspaceId) {
      throw new ForbiddenError(
        'Push subscription request has no session for this user workspace',
      );
    }

    await this.pushSubscriptionRepository.delete(workspaceId, {
      userSessionId: session.id,
      endpoint: Not(input.endpoint),
    });

    await this.pushSubscriptionRepository.upsert(
      workspaceId,
      {
        endpoint: input.endpoint,
        p256dhKey: input.p256dhKey,
        authSecret: input.authSecret,
        applicationServerKey: input.applicationServerKey,
        userSessionId: session.id,
      },
      ['workspaceId', 'endpoint'],
    );
  }

  async updateFocusedTab({
    workspaceId,
    userId,
    tabId,
    isFocused,
  }: {
    workspaceId: string;
    userId: string;
    tabId: string;
    isFocused: boolean;
  }): Promise<void> {
    const focusedTabKey = getFocusedTabKey(workspaceId, userId);

    if (isFocused) {
      await this.cacheStorageService.set(
        focusedTabKey,
        tabId,
        FOCUSED_TAB_TTL_MS,
      );

      return;
    }

    const focusedTabId =
      await this.cacheStorageService.get<string>(focusedTabKey);

    if (focusedTabId === tabId) {
      await this.cacheStorageService.del(focusedTabKey);
    }
  }

  async hasFocusedTab({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<boolean> {
    return isDefined(
      await this.cacheStorageService.get<string>(
        getFocusedTabKey(workspaceId, userId),
      ),
    );
  }

  async sendNotificationToUser({
    workspaceId,
    userId,
    notification,
  }: {
    workspaceId: string;
    userId: string;
    notification: WebPushNotification;
  }): Promise<void> {
    const activeUserSessions =
      await this.userSessionService.findActiveSessionsForUserWorkspace({
        userId,
        workspaceId,
      });

    if (activeUserSessions.length === 0) {
      return;
    }

    const vapidKeyPair = deriveWebPushVapidKeyPair({
      twentyConfigService: this.twentyConfigService,
    });
    const pushSubscriptions = await this.pushSubscriptionRepository.find(
      workspaceId,
      {
        where: {
          userSessionId: In(activeUserSessions.map(({ id }) => id)),
          applicationServerKey: vapidKeyPair.publicKey,
        },
      },
    );

    if (pushSubscriptions.length === 0) {
      return;
    }

    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const subject = serverUrl.startsWith('https:')
      ? serverUrl
      : `mailto:${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}`;
    const httpClient = this.secureHttpClientService.getHttpClient(undefined, {
      workspaceId,
      source: 'web-push',
      userId,
    });

    for (const pushSubscription of pushSubscriptions) {
      try {
        const { endpoint, headers, body } = generateRequestDetails(
          {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: pushSubscription.p256dhKey,
              auth: pushSubscription.authSecret,
            },
          },
          JSON.stringify(notification),
          {
            vapidDetails: { subject, ...vapidKeyPair },
            TTL: PUSH_SERVICE_MESSAGE_TTL_SECONDS,
            urgency: 'high',
          },
        );

        const response = await httpClient.post(endpoint, body, {
          headers,
          validateStatus: () => true,
        });

        if (EXPIRED_PUSH_SUBSCRIPTION_STATUS_CODES.includes(response.status)) {
          await this.pushSubscriptionRepository.delete(workspaceId, {
            id: pushSubscription.id,
          });
        } else if (response.status >= 400) {
          this.logger.warn(
            `Push service answered ${response.status} for push subscription ${pushSubscription.id} in workspace ${workspaceId}`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Could not send to push subscription ${pushSubscription.id} in workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }
}
