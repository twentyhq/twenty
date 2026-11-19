import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Not } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { type UpsertPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-push-subscription.input';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';
import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';
import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const FOCUSED_TAB_TTL_MS = 45_000;

const getFocusedTabKey = (workspaceId: string, userId: string) =>
  `focused-tab:${workspaceId}:${userId}`;

@Injectable()
export class WebPushService {
  constructor(
    @InjectWorkspaceScopedRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: WorkspaceScopedRepository<PushSubscriptionEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWebPush)
    private readonly cacheStorageService: CacheStorageService,
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
      ? await this.userSessionService.findActiveSessionByToken(sessionToken)
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
}
