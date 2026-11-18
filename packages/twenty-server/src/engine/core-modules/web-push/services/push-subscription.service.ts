import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Not } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { MAX_PUSH_SUBSCRIPTIONS_PER_USER_WORKSPACE } from 'src/engine/core-modules/web-push/constants/max-push-subscriptions-per-user-workspace.constant';
import { type UpsertPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-push-subscription.input';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';
import { getWebPushVapidKeyPairs } from 'src/engine/core-modules/web-push/utils/get-web-push-vapid-key-pairs.util';
import { isWebPushEndpointAllowed } from 'src/engine/core-modules/web-push/utils/is-web-push-endpoint-allowed.util';
import {
  WebPushException,
  WebPushExceptionCode,
} from 'src/engine/core-modules/web-push/web-push.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class PushSubscriptionService {
  constructor(
    @InjectWorkspaceScopedRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: WorkspaceScopedRepository<PushSubscriptionEntity>,
    private readonly userSessionService: UserSessionService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async upsertPushSubscription({
    input,
    workspaceId,
    userWorkspaceId,
    sessionToken,
    origin,
  }: {
    input: UpsertPushSubscriptionInput;
    workspaceId: string;
    userWorkspaceId: string;
    sessionToken: string | undefined;
    origin: string | undefined;
  }): Promise<void> {
    if (!isWebPushEndpointAllowed(input.endpoint)) {
      throw new WebPushException(
        'Push subscription endpoint is not on an allowed push service',
        WebPushExceptionCode.PUSH_SUBSCRIPTION_ENDPOINT_NOT_ALLOWED,
      );
    }

    const isKnownApplicationServerKey = getWebPushVapidKeyPairs({
      twentyConfigService: this.twentyConfigService,
    }).some(({ publicKey }) => publicKey === input.applicationServerKey);

    if (!isKnownApplicationServerKey) {
      throw new WebPushException(
        'Push subscription was created with an unknown application server key',
        WebPushExceptionCode.PUSH_SUBSCRIPTION_KEY_UNKNOWN,
      );
    }

    if (!isNonEmptyString(origin)) {
      throw new WebPushException(
        'Push subscription request has no Origin header',
        WebPushExceptionCode.PUSH_SUBSCRIPTION_ORIGIN_MISSING,
      );
    }

    const session = isNonEmptyString(sessionToken)
      ? await this.userSessionService.findSessionByToken(sessionToken)
      : null;

    if (!isDefined(session) || session.userWorkspaceId !== userWorkspaceId) {
      throw new WebPushException(
        'Push subscription request has no session for this user workspace',
        WebPushExceptionCode.PUSH_SUBSCRIPTION_SESSION_NOT_FOUND,
      );
    }

    const otherPushSubscriptionCount =
      await this.pushSubscriptionRepository.count(workspaceId, {
        where: {
          endpoint: Not(input.endpoint),
          userSession: { userWorkspaceId },
        },
      });

    if (
      otherPushSubscriptionCount >= MAX_PUSH_SUBSCRIPTIONS_PER_USER_WORKSPACE
    ) {
      throw new WebPushException(
        `User workspace ${userWorkspaceId} reached ${MAX_PUSH_SUBSCRIPTIONS_PER_USER_WORKSPACE} push subscriptions`,
        WebPushExceptionCode.PUSH_SUBSCRIPTION_LIMIT_REACHED,
      );
    }

    await this.pushSubscriptionRepository.upsert(
      workspaceId,
      {
        endpoint: input.endpoint,
        p256dhKey: input.p256dhKey,
        authSecret: input.authSecret,
        applicationServerKey: input.applicationServerKey,
        origin,
        userSessionId: session.id,
      },
      ['workspaceId', 'endpoint'],
    );
  }

  async deletePushSubscription({
    endpoint,
    workspaceId,
    userWorkspaceId,
  }: {
    endpoint: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const pushSubscription = await this.pushSubscriptionRepository.findOne(
      workspaceId,
      { where: { endpoint, userSession: { userWorkspaceId } } },
    );

    if (!isDefined(pushSubscription)) {
      return;
    }

    await this.pushSubscriptionRepository.delete(workspaceId, {
      id: pushSubscription.id,
    });
  }
}
