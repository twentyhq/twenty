import { Injectable, Logger } from '@nestjs/common';

import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, MoreThan } from 'typeorm';
import { generateRequestDetails } from 'web-push';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PushSubscriptionEntity } from 'src/engine/core-modules/web-push/push-subscription.entity';
import { type WebPushNotification } from 'src/engine/core-modules/web-push/types/web-push-notification.type';
import { getWebPushSubject } from 'src/engine/core-modules/web-push/utils/get-web-push-subject.util';
import { getWebPushVapidKeyPairs } from 'src/engine/core-modules/web-push/utils/get-web-push-vapid-key-pairs.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const WEB_PUSH_TTL_SECONDS = 3600;

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    @InjectWorkspaceScopedRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: WorkspaceScopedRepository<PushSubscriptionEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {}

  async sendToUser({
    workspace,
    userId,
    notification,
  }: {
    workspace: Pick<
      WorkspaceEntity,
      'id' | 'subdomain' | 'customDomain' | 'isCustomDomainEnabled'
    >;
    userId: string;
    notification: WebPushNotification;
  }): Promise<void> {
    const keyPairs = getWebPushVapidKeyPairs({
      twentyConfigService: this.twentyConfigService,
    });

    if (keyPairs.length === 0) {
      return;
    }

    const now = Date.now();
    const pushSubscriptions = await this.pushSubscriptionRepository.find(
      workspace.id,
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

    const { subdomainUrl, customUrl } =
      this.workspaceDomainsService.getWorkspaceUrls(workspace);
    const workspaceOrigins = [subdomainUrl, customUrl]
      .filter(isDefined)
      .map((url) => new URL(url).origin);
    const subject = getWebPushSubject({
      twentyConfigService: this.twentyConfigService,
    });
    const httpClient = this.secureHttpClientService.getHttpClient(undefined, {
      workspaceId: workspace.id,
      source: 'web-push',
      userId,
    });

    for (const pushSubscription of pushSubscriptions) {
      if (!workspaceOrigins.includes(pushSubscription.origin)) {
        continue;
      }

      const keyPair = keyPairs.find(
        ({ publicKey }) => publicKey === pushSubscription.applicationServerKey,
      );

      if (!isDefined(keyPair)) {
        await this.pushSubscriptionRepository.delete(workspace.id, {
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
          vapidDetails: { subject, ...keyPair },
          TTL: WEB_PUSH_TTL_SECONDS,
          urgency: 'high',
        },
      );

      const response = await httpClient.post(endpoint, body, {
        headers,
        validateStatus: () => true,
      });

      if (response.status === 404 || response.status === 410) {
        await this.pushSubscriptionRepository.delete(workspace.id, {
          id: pushSubscription.id,
        });

        continue;
      }

      if (response.status >= 400) {
        this.logger.warn(
          `Push service answered ${response.status} for push subscription ${pushSubscription.id} in workspace ${workspace.id}`,
        );
      }
    }
  }
}
