import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FOCUSED_TAB_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Not } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { type UpsertWebPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-web-push-subscription.input';
import { WebPushSubscriptionEntity } from 'src/engine/core-modules/web-push/web-push-subscription.entity';
import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';
import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';
import {
  WebPushException,
  WebPushExceptionCode,
} from 'src/engine/core-modules/web-push/web-push.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const FOCUSED_TAB_TTL_MS = FOCUSED_TAB_HEARTBEAT_INTERVAL_MS * 2;

const getFocusedTabKey = (workspaceId: string, workspaceMemberId: string) =>
  `focused-tab:${workspaceId}:${workspaceMemberId}`;

@Injectable()
export class WebPushService {
  constructor(
    @InjectWorkspaceScopedRepository(WebPushSubscriptionEntity)
    private readonly webPushSubscriptionRepository: WorkspaceScopedRepository<WebPushSubscriptionEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
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

    const focusedTabId =
      await this.cacheStorageService.get<string>(focusedTabKey);

    if (focusedTabId === tabId) {
      await this.cacheStorageService.del(focusedTabKey);
    }
  }
}
