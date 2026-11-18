import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, MoreThan, Not } from 'typeorm';
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
import { getWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/get-web-push-vapid-key-pair.util';
import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const FOCUSED_TAB_TTL_MS = 45_000;
const WEB_PUSH_TTL_SECONDS = 3600;

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

    const { publicKey } = getWebPushVapidKeyPair({
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
    const key = getFocusedTabKey(workspaceId, userId);

    if (isFocused) {
      await this.cacheStorageService.set(key, tabId, FOCUSED_TAB_TTL_MS);

      return;
    }

    if ((await this.cacheStorageService.get<string>(key)) === tabId) {
      await this.cacheStorageService.del(key);
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

  async sendToUser({
    workspaceId,
    userId,
    notification,
  }: {
    workspaceId: string;
    userId: string;
    notification: WebPushNotification;
  }): Promise<void> {
    const now = Date.now();
    const pushSubscriptions = await this.pushSubscriptionRepository.find(
      workspaceId,
      {
        where: {
          userSession: {
            userId,
            revokedAt: IsNull(),
            expiresAt: MoreThan(new Date(now)),
            lastActiveAt: MoreThan(
              new Date(
                now - ms(this.twentyConfigService.get('SESSION_IDLE_TIMEOUT')),
              ),
            ),
          },
        },
      },
    );

    if (pushSubscriptions.length === 0) {
      return;
    }

    const vapidKeyPair = getWebPushVapidKeyPair({
      twentyConfigService: this.twentyConfigService,
    });
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
      if (pushSubscription.applicationServerKey !== vapidKeyPair.publicKey) {
        await this.pushSubscriptionRepository.delete(workspaceId, {
          id: pushSubscription.id,
        });

        continue;
      }

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
          TTL: WEB_PUSH_TTL_SECONDS,
          urgency: 'high',
        },
      );

      const response = await httpClient.post(endpoint, body, {
        headers,
        validateStatus: () => true,
      });

      if (response.status === 404 || response.status === 410) {
        await this.pushSubscriptionRepository.delete(workspaceId, {
          id: pushSubscription.id,
        });
      } else if (response.status >= 400) {
        this.logger.warn(
          `Push service answered ${response.status} for push subscription ${pushSubscription.id} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
