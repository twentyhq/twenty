import { type CoreApiClient } from 'twenty-client-sdk/core';

export type SlackAssistantRequestTestRecord = {
  id: string;
  name: string;
  status: string;
  slackEventId: string;
  slackChannelId: string;
  slackChannelType: string;
  slackThreadTimestamp: string;
  slackMessageTimestamp: string;
  slackUserId: string;
  requestText: string;
  responseText: string;
  errorMessage: string;
};

const RECORD_FIELDS = {
  id: true,
  name: true,
  status: true,
  slackEventId: true,
  slackChannelId: true,
  slackChannelType: true,
  slackThreadTimestamp: true,
  slackMessageTimestamp: true,
  slackUserId: true,
  requestText: true,
  responseText: true,
  errorMessage: true,
} as const;

export const findSlackAssistantRequestByMessage = async (
  client: CoreApiClient,
  {
    slackChannelId,
    slackMessageTimestamp,
  }: { slackChannelId: string; slackMessageTimestamp: string },
): Promise<SlackAssistantRequestTestRecord | undefined> => {
  const result = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: {
          slackChannelId: { eq: slackChannelId },
          slackMessageTimestamp: { eq: slackMessageTimestamp },
        },
        first: 2,
      },
      edges: { node: RECORD_FIELDS },
    },
  });

  return result.slackAssistantRequests?.edges?.[0]?.node as
    | SlackAssistantRequestTestRecord
    | undefined;
};

export const countSlackAssistantRequestsByMessage = async (
  client: CoreApiClient,
  {
    slackChannelId,
    slackMessageTimestamp,
  }: { slackChannelId: string; slackMessageTimestamp: string },
): Promise<number> => {
  const result = await client.query({
    slackAssistantRequests: {
      __args: {
        filter: {
          slackChannelId: { eq: slackChannelId },
          slackMessageTimestamp: { eq: slackMessageTimestamp },
        },
        first: 10,
      },
      edges: { node: { id: true } },
    },
  });

  return result.slackAssistantRequests?.edges?.length ?? 0;
};

export const createSlackAssistantRequestRecord = async (
  client: CoreApiClient,
  data: Record<string, unknown>,
): Promise<SlackAssistantRequestTestRecord> => {
  const result = await client.mutation({
    createSlackAssistantRequest: {
      __args: { data },
      ...RECORD_FIELDS,
    },
  });

  return result.createSlackAssistantRequest as SlackAssistantRequestTestRecord;
};

export const findSlackAssistantRequestById = async (
  client: CoreApiClient,
  id: string,
): Promise<SlackAssistantRequestTestRecord | undefined> => {
  const result = await client.query({
    slackAssistantRequest: {
      __args: { filter: { id: { eq: id } } },
      ...RECORD_FIELDS,
    },
  });

  return result.slackAssistantRequest as
    | SlackAssistantRequestTestRecord
    | undefined;
};

export const destroySlackAssistantRequestRecords = async (
  client: CoreApiClient,
  ids: string[],
): Promise<void> => {
  for (const id of ids) {
    await client
      .mutation({ destroySlackAssistantRequest: { __args: { id }, id: true } })
      .catch(() => undefined);
  }
};
