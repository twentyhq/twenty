import { type ApplicationHealthCheckResult } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_CONNECTION_BANNER_ACTION } from 'src/logic-functions/constants/slack-connection-banner-action';
import { SLACK_CONNECTION_HEALTH_BANNERS } from 'src/logic-functions/constants/slack-connection-health-banners';
import { SLACK_CONNECTION_STATUS_TIMEOUT_MS } from 'src/logic-functions/constants/slack-connection-status-timeout-ms';
import { SLACK_NOT_CONNECTED_BANNER } from 'src/logic-functions/constants/slack-not-connected-banner';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

export const slackHealthCheckHandler =
  async (): Promise<ApplicationHealthCheckResult> => {
    const slackClientResult = await getSlackClient({
      timeout: SLACK_CONNECTION_STATUS_TIMEOUT_MS,
      retryConfig: { retries: 0 },
    });

    if (!slackClientResult.success) {
      if (!slackClientResult.isConnectionMissing) {
        return { status: 'OK' };
      }

      return {
        status: 'WARNING',
        ...SLACK_NOT_CONNECTED_BANNER,
        action: SLACK_CONNECTION_BANNER_ACTION,
      };
    }

    const { connectionHealth } = await resolveSlackConnectionHealth({
      slackClient: slackClientResult.client,
      connectionId: slackClientResult.connectionId,
    });

    const healthBanner = isDefined(connectionHealth)
      ? SLACK_CONNECTION_HEALTH_BANNERS[connectionHealth]
      : undefined;

    // An unverified health reads as undefined here, so a transient Slack
    // failure never tells an admin to reconnect a working integration.
    if (!isDefined(healthBanner)) {
      return { status: 'OK' };
    }

    return {
      status: 'ERROR',
      title: healthBanner.title,
      description: healthBanner.description,
      action: SLACK_CONNECTION_BANNER_ACTION,
    };
  };
