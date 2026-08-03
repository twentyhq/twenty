import { defineLogicFunction, type  RoutePayload } from 'twenty-sdk/define';

import { SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackListChannelsHandler } from 'src/logic-functions/handlers/slack-list-channels-handler';
import { type SlackChannelType } from 'src/logic-functions/types/slack-list-channels-input.type';

const VALID_CHANNEL_TYPES: SlackChannelType[] = ['Public', 'Private', 'All'];

const isSlackChannelType = (value: unknown): value is SlackChannelType =>
  typeof value === 'string' &&
  VALID_CHANNEL_TYPES.includes(value as SlackChannelType);

const handler = async (event: RoutePayload) => {
  const params = event.queryStringParameters ?? {};

  const rawLimit = params.limit;
  const parsedLimit =
    typeof rawLimit === 'string' && rawLimit.length > 0
      ? Number(rawLimit)
      : undefined;

  return slackListChannelsHandler({
    channelType: isSlackChannelType(params.channelType)
      ? params.channelType
      : undefined,
    excludeArchived: params.excludeArchived === 'false' ? false : undefined,
    limit:
      typeof parsedLimit === 'number' && Number.isFinite(parsedLimit)
        ? parsedLimit
        : undefined,
  });
};

export default defineLogicFunction({
  universalIdentifier: SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'slack-list-channels-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/slack/channels',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
