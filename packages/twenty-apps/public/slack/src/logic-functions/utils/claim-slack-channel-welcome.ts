import { isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

export type SlackChannelWelcome = {
  expiresAt: number;
};

const SLACK_CHANNEL_WELCOME_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const claimSlackChannelWelcome = async (
  channelId: string,
): Promise<boolean> => {
  const key = `slack-channel-welcome:${channelId}`;
  const existingWelcome = await kv.get<SlackChannelWelcome>(key);

  if (
    existingWelcome !== null &&
    isNumber(existingWelcome.expiresAt) &&
    existingWelcome.expiresAt > Date.now()
  ) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + SLACK_CHANNEL_WELCOME_TTL_MS,
  } satisfies SlackChannelWelcome);

  return true;
};
