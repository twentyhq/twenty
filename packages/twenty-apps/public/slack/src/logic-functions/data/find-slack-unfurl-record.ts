import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';

type SlackUnfurlRecordSelection = {
  queryField: string;
  node: Record<string, unknown>;
};

// Selections stick to standard fields: a single unknown field fails the
// whole GraphQL query, and dev-seeded workspaces carry custom fields
// (employees, city, ...) that other workspaces do not have.
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
      avatarUrl: true,
      emails: { primaryEmail: true },
      phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
      linkedinLink: { primaryLinkUrl: true },
      company: { id: true, name: true, domainName: { primaryLinkUrl: true } },
      createdAt: true,
      updatedAt: true,
    },
  },
  company: {
    queryField: 'companies',
    node: {
      id: true,
      name: true,
      domainName: { primaryLinkUrl: true },
      linkedinLink: { primaryLinkUrl: true },
      annualRevenue: { amountMicros: true, currencyCode: true },
      address: { addressCity: true, addressCountry: true },
      accountOwner: { id: true, name: { firstName: true, lastName: true } },
      createdAt: true,
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
      company: { id: true, name: true, domainName: { primaryLinkUrl: true } },
      pointOfContact: { id: true, name: { firstName: true, lastName: true } },
      createdAt: true,
      updatedAt: true,
    },
  },
  note: {
    queryField: 'notes',
    node: {
      id: true,
      title: true,
      bodyV2: { markdown: true },
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
      bodyV2: { markdown: true },
      assignee: { id: true, name: { firstName: true, lastName: true } },
      createdAt: true,
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
