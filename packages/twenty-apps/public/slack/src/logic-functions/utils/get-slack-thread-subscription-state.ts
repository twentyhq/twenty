import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackThreadSubscriptionState } from 'src/logic-functions/types/slack-thread-subscription-state.type';
import { type SlackThreadSubscription } from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';
import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

export const getSlackThreadSubscriptionState = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<SlackThreadSubscriptionState> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return 'none';
  }

  const key = getSlackThreadKvKey({ channelId, threadTimestamp });
  const subscription = await kv.get<SlackThreadSubscription>(key);

  if (!isDefined(subscription) || !isNumber(subscription.expiresAt)) {
    return 'none';
  }

  return hasKvEntryExpired(subscription) ? 'expired' : 'active';
};
