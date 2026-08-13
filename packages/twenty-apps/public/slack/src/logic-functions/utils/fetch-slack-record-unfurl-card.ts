import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { type SlackRecordUnfurlCard } from 'src/logic-functions/types/slack-record-unfurl-card.type';
import { buildSlackRecordUnfurlCardFields } from 'src/logic-functions/utils/build-slack-record-unfurl-card-fields';
import {
  formatSlackUnfurlCurrencyAmount,
  formatSlackUnfurlDate,
  formatSlackUnfurlSelectValue,
} from 'src/logic-functions/utils/format-slack-unfurl-field-values';

// The generated CoreApiClient is untyped at build time; the query shape is
// validated by the workspace GraphQL API at runtime.
type CoreRecordQueryClient = {
  query: (
    queryInput: Record<string, unknown>,
  ) => Promise<Record<string, any> | null | undefined>;
};

type SlackUnfurlObjectConfig = {
  objectLabel: string;
  buildQuery: (recordId: string) => Record<string, unknown>;
  buildCard: (record: any) => Omit<SlackRecordUnfurlCard, 'objectLabel'>;
};

const buildRecordFilterArgs = (recordId: string) => ({
  filter: { id: { eq: recordId } },
});

const buildFullName = (
  name: { firstName?: string | null; lastName?: string | null } | null | undefined,
): string =>
  [name?.firstName, name?.lastName].filter(isNonEmptyString).join(' ');

const SLACK_UNFURL_OBJECT_CONFIGS: Record<string, SlackUnfurlObjectConfig> = {
  person: {
    objectLabel: 'Person',
    buildQuery: (recordId) => ({
      person: {
        __args: buildRecordFilterArgs(recordId),
        name: { firstName: true, lastName: true },
        jobTitle: true,
        emails: { primaryEmail: true },
        company: { name: true },
      },
    }),
    buildCard: (record) => ({
      recordTitle: buildFullName(record.name) || 'Person',
      fields: buildSlackRecordUnfurlCardFields([
        ['Company', record.company?.name],
        ['Job title', record.jobTitle],
        ['Email', record.emails?.primaryEmail],
      ]),
    }),
  },
  company: {
    objectLabel: 'Company',
    buildQuery: (recordId) => ({
      company: {
        __args: buildRecordFilterArgs(recordId),
        name: true,
        domainName: { primaryLinkUrl: true },
        address: { addressCity: true },
        annualRevenue: { amountMicros: true, currencyCode: true },
      },
    }),
    buildCard: (record) => ({
      recordTitle: isNonEmptyString(record.name) ? record.name : 'Company',
      fields: buildSlackRecordUnfurlCardFields([
        ['Domain', record.domainName?.primaryLinkUrl],
        ['City', record.address?.addressCity],
        [
          'ARR',
          isDefined(record.annualRevenue)
            ? formatSlackUnfurlCurrencyAmount(record.annualRevenue)
            : undefined,
        ],
      ]),
    }),
  },
  opportunity: {
    objectLabel: 'Opportunity',
    buildQuery: (recordId) => ({
      opportunity: {
        __args: buildRecordFilterArgs(recordId),
        name: true,
        stage: true,
        amount: { amountMicros: true, currencyCode: true },
        closeDate: true,
        company: { name: true },
      },
    }),
    buildCard: (record) => ({
      recordTitle: isNonEmptyString(record.name) ? record.name : 'Opportunity',
      fields: buildSlackRecordUnfurlCardFields([
        [
          'Stage',
          isNonEmptyString(record.stage)
            ? formatSlackUnfurlSelectValue(record.stage)
            : undefined,
        ],
        [
          'Amount',
          isDefined(record.amount)
            ? formatSlackUnfurlCurrencyAmount(record.amount)
            : undefined,
        ],
        [
          'Close date',
          isNonEmptyString(record.closeDate)
            ? formatSlackUnfurlDate(record.closeDate)
            : undefined,
        ],
        ['Company', record.company?.name],
      ]),
    }),
  },
  note: {
    objectLabel: 'Note',
    buildQuery: (recordId) => ({
      note: {
        __args: buildRecordFilterArgs(recordId),
        title: true,
        createdAt: true,
        createdBy: { name: true },
      },
    }),
    buildCard: (record) => ({
      recordTitle: isNonEmptyString(record.title) ? record.title : 'Note',
      fields: buildSlackRecordUnfurlCardFields([
        [
          'Created',
          isNonEmptyString(record.createdAt)
            ? formatSlackUnfurlDate(record.createdAt)
            : undefined,
        ],
        ['Created by', record.createdBy?.name],
      ]),
    }),
  },
  task: {
    objectLabel: 'Task',
    buildQuery: (recordId) => ({
      task: {
        __args: buildRecordFilterArgs(recordId),
        title: true,
        status: true,
        dueAt: true,
        assignee: { name: { firstName: true, lastName: true } },
      },
    }),
    buildCard: (record) => ({
      recordTitle: isNonEmptyString(record.title) ? record.title : 'Task',
      fields: buildSlackRecordUnfurlCardFields([
        [
          'Status',
          isNonEmptyString(record.status)
            ? formatSlackUnfurlSelectValue(record.status)
            : undefined,
        ],
        [
          'Due date',
          isNonEmptyString(record.dueAt)
            ? formatSlackUnfurlDate(record.dueAt)
            : undefined,
        ],
        [
          'Assignee',
          isDefined(record.assignee)
            ? buildFullName(record.assignee.name)
            : undefined,
        ],
      ]),
    }),
  },
};

export const fetchSlackRecordUnfurlCard = async ({
  objectNameSingular,
  recordId,
}: SlackRecordLink): Promise<SlackRecordUnfurlCard | undefined> => {
  const config = SLACK_UNFURL_OBJECT_CONFIGS[objectNameSingular];

  if (!isDefined(config)) {
    return undefined;
  }

  try {
    const client = new CoreApiClient() as unknown as CoreRecordQueryClient;
    const result = await client.query(config.buildQuery(recordId));
    const record = result?.[objectNameSingular];

    if (!isDefined(record)) {
      return undefined;
    }

    return { objectLabel: config.objectLabel, ...config.buildCard(record) };
  } catch (error) {
    console.warn(
      `[slack] skipping unfurl for ${objectNameSingular} ${recordId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
