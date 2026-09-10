import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

type SlackUnfurlRecordSelection = {
  queryField: 'people' | 'companies' | 'opportunities' | 'notes' | 'tasks';
  cardNode: Record<string, unknown>;
  detailsNode: Record<string, unknown>;
};

// The card is fetched with only what it renders: a field the reader may not
// see would otherwise fail the whole query and drop an otherwise readable
// card, and the sensitive values would enter the function for nothing.
const RECORD_SELECTIONS: Record<
  SlackUnfurlObjectName,
  SlackUnfurlRecordSelection
> = {
  person: {
    queryField: 'people',
    cardNode: {
      id: true,
      name: { firstName: true, lastName: true },
      jobTitle: true,
      avatarUrl: true,
      company: { id: true, name: true, domainName: { primaryLinkUrl: true } },
      createdAt: true,
      updatedAt: true,
    },
    detailsNode: {
      emails: { primaryEmail: true },
      phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
      linkedinLink: { primaryLinkUrl: true },
    },
  },
  company: {
    queryField: 'companies',
    cardNode: {
      id: true,
      name: true,
      domainName: { primaryLinkUrl: true },
      address: { addressCity: true },
      createdAt: true,
      updatedAt: true,
    },
    detailsNode: {
      linkedinLink: { primaryLinkUrl: true },
      annualRevenue: { amountMicros: true, currencyCode: true },
      address: { addressCity: true, addressCountry: true },
      accountOwner: { id: true, name: { firstName: true, lastName: true } },
    },
  },
  opportunity: {
    queryField: 'opportunities',
    cardNode: {
      id: true,
      name: true,
      stage: true,
      closeDate: true,
      company: { id: true, name: true, domainName: { primaryLinkUrl: true } },
      createdAt: true,
      updatedAt: true,
    },
    detailsNode: {
      amount: { amountMicros: true, currencyCode: true },
      pointOfContact: { id: true, name: { firstName: true, lastName: true } },
    },
  },
  note: {
    queryField: 'notes',
    cardNode: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    detailsNode: {
      bodyV2: { markdown: true },
    },
  },
  task: {
    queryField: 'tasks',
    cardNode: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
      createdAt: true,
      updatedAt: true,
    },
    detailsNode: {
      bodyV2: { markdown: true },
      assignee: { id: true, name: { firstName: true, lastName: true } },
    },
  },
};

export const findSlackUnfurlRecord = async ({
  client,
  objectNameSingular,
  recordId,
  includeDetails = false,
}: {
  client: CoreApiClient;
  objectNameSingular: SlackUnfurlObjectName;
  recordId: string;
  includeDetails?: boolean;
}): Promise<Record<string, unknown> | undefined> => {
  const { queryField, cardNode, detailsNode } =
    RECORD_SELECTIONS[objectNameSingular];
  const node = includeDetails ? { ...cardNode, ...detailsNode } : cardNode;

  const queryResult = await client.query({
    [queryField]: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: { node },
    },
  });

  const record = queryResult?.[queryField]?.edges?.[0]?.node;

  return asRecord(record);
};
