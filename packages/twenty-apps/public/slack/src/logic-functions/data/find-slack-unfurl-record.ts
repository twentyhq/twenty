import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';

type SlackUnfurlRecordSelection = {
  queryField: string;
  node: Record<string, unknown>;
};

const RECORD_SELECTIONS: Record<
  SlackUnfurlObjectName,
  SlackUnfurlRecordSelection
> = {
  person: {
    queryField: 'people',
    node: {
      id: true,
      name: { firstName: true, lastName: true },
      jobTitle: true,
      city: true,
      emails: { primaryEmail: true },
      phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
      updatedAt: true,
    },
  },
  company: {
    queryField: 'companies',
    node: {
      id: true,
      name: true,
      employees: true,
      domainName: { primaryLinkUrl: true },
      address: { addressCity: true },
      updatedAt: true,
    },
  },
  opportunity: {
    queryField: 'opportunities',
    node: {
      id: true,
      name: true,
      stage: true,
      amount: { amountMicros: true, currencyCode: true },
      closeDate: true,
      updatedAt: true,
    },
  },
  note: {
    queryField: 'notes',
    node: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  task: {
    queryField: 'tasks',
    node: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
      updatedAt: true,
    },
  },
};

export const findSlackUnfurlRecord = async (
  client: CoreApiClient,
  {
    objectNameSingular,
    recordId,
  }: {
    objectNameSingular: SlackUnfurlObjectName;
    recordId: string;
  },
): Promise<Record<string, unknown> | undefined> => {
  const { queryField, node } = RECORD_SELECTIONS[objectNameSingular];

  const queryResult = await client.query({
    [queryField]: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: { node },
    },
  });

  const record = queryResult?.[queryField]?.edges?.[0]?.node;

  return isDefined(record) ? (record as Record<string, unknown>) : undefined;
};
