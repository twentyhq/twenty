import { claimSlackKvThrottle } from 'src/logic-functions/utils/claim-slack-kv-throttle';
import { getSlackChannelWelcomeKvKey } from 'src/logic-functions/utils/get-slack-channel-welcome-kv-key';

const SLACK_CHANNEL_WELCOME_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const claimSlackChannelWelcome = async (
  channelId: string,
): Promise<boolean> =>
  claimSlackKvThrottle({
    key: getSlackChannelWelcomeKvKey(channelId),
    ttlMs: SLACK_CHANNEL_WELCOME_TTL_MS,
  });
