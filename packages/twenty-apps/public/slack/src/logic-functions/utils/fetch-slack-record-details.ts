import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  type SlackRecordDetails,
  type SlackRecordField,
} from 'src/logic-functions/types/slack-record-details.type';
import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { formatSlackRecordAmount } from 'src/logic-functions/utils/format-slack-record-amount';
import { formatSlackRecordDate } from 'src/logic-functions/utils/format-slack-record-date';
import { formatSlackRecordSelectValue } from 'src/logic-functions/utils/format-slack-record-select-value';
import { getCompanyFaviconUrl } from 'src/logic-functions/utils/get-company-favicon-url';

type CurrencyValue = {
  amountMicros?: string | number | null;
  currencyCode?: string | null;
};

type RecordNode = {
  id?: string;
  stage?: string | null;
  amount?: CurrencyValue | null;
  closeDate?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
  annualRevenue?: CurrencyValue | null;
  jobTitle?: string | null;
  emails?: { primaryEmail?: string | null } | null;
  company?: { name?: string | null } | null;
  status?: string | null;
  dueAt?: string | null;
};

const buildCurrencyField = (
  label: string,
  currencyValue: CurrencyValue | null | undefined,
): SlackRecordField | undefined => {
  const rawAmountMicros = currencyValue?.amountMicros;

  if (rawAmountMicros === null || rawAmountMicros === undefined) {
    return undefined;
  }

  const amountMicros = Number(rawAmountMicros);

  if (!Number.isFinite(amountMicros)) {
    return undefined;
  }

  return {
    label,
    value: formatSlackRecordAmount({
      amountMicros,
      currencyCode: currencyValue?.currencyCode ?? undefined,
    }),
  };
};

const buildDateField = (
  label: string,
  isoDate: string | null | undefined,
): SlackRecordField | undefined => {
  if (!isNonEmptyString(isoDate)) {
    return undefined;
  }

  const formattedDate = formatSlackRecordDate(isoDate);

  return formattedDate === undefined
    ? undefined
    : { label, value: formattedDate };
};

const buildSelectField = (
  label: string,
  value: string | null | undefined,
): SlackRecordField | undefined =>
  isNonEmptyString(value)
    ? { label, value: formatSlackRecordSelectValue(value) }
    : undefined;

const buildTextField = (
  label: string,
  value: string | null | undefined,
): SlackRecordField | undefined =>
  isNonEmptyString(value) ? { label, value } : undefined;

const isRecordField = (
  field: SlackRecordField | undefined,
): field is SlackRecordField => field !== undefined;

// headline fields per standard object; custom objects render without details
const RECORD_DETAIL_QUERY_CONFIGS: Record<
  string,
  {
    queryFieldName: string;
    selection: object;
    buildDetails: (node: RecordNode) => SlackRecordDetails;
  }
> = {
  opportunity: {
    queryFieldName: 'opportunities',
    selection: {
      stage: true,
      amount: { amountMicros: true, currencyCode: true },
      closeDate: true,
    },
    buildDetails: (node) => ({
      fields: [
        buildSelectField('Stage', node.stage),
        buildCurrencyField('Amount', node.amount),
        buildDateField('Close date', node.closeDate),
      ].filter(isRecordField),
    }),
  },
  company: {
    queryFieldName: 'companies',
    selection: {
      domainName: { primaryLinkUrl: true },
      annualRevenue: { amountMicros: true, currencyCode: true },
    },
    buildDetails: (node) => ({
      fields: [
        buildTextField('Domain', node.domainName?.primaryLinkUrl),
        buildCurrencyField('Annual revenue', node.annualRevenue),
      ].filter(isRecordField),
      imageUrl: getCompanyFaviconUrl(node.domainName?.primaryLinkUrl),
    }),
  },
  person: {
    queryFieldName: 'people',
    selection: {
      jobTitle: true,
      emails: { primaryEmail: true },
      company: { name: true },
    },
    buildDetails: (node) => ({
      fields: [
        buildTextField('Role', node.jobTitle),
        buildTextField('Email', node.emails?.primaryEmail),
        buildTextField('Company', node.company?.name),
      ].filter(isRecordField),
    }),
  },
  task: {
    queryFieldName: 'tasks',
    selection: {
      status: true,
      dueAt: true,
    },
    buildDetails: (node) => ({
      fields: [
        buildSelectField('Status', node.status),
        buildDateField('Due', node.dueAt),
      ].filter(isRecordField),
    }),
  },
};

export const fetchSlackRecordDetails = async (
  client: CoreApiClient,
  references: SlackRecordReference[],
): Promise<Map<string, SlackRecordDetails>> => {
  const detailsByRecordId = new Map<string, SlackRecordDetails>();

  const referencesByObjectName = new Map<string, SlackRecordReference[]>();

  for (const reference of references) {
    const objectNameSingular = reference.objectNameSingular.toLowerCase();

    referencesByObjectName.set(objectNameSingular, [
      ...(referencesByObjectName.get(objectNameSingular) ?? []),
      reference,
    ]);
  }

  await Promise.all(
    [...referencesByObjectName.entries()].map(
      async ([objectNameSingular, objectReferences]) => {
        const config = RECORD_DETAIL_QUERY_CONFIGS[objectNameSingular];

        if (config === undefined) {
          return;
        }

        const recordIds = objectReferences.map(
          (reference) => reference.recordId,
        );

        try {
          const queryResult = await client.query({
            [config.queryFieldName]: {
              __args: {
                filter: { id: { in: recordIds } },
                first: recordIds.length,
              },
              edges: { node: { id: true, ...config.selection } },
            },
          });

          const edges: { node?: RecordNode }[] =
            queryResult[config.queryFieldName]?.edges ?? [];

          for (const edge of edges) {
            const node = edge.node;

            if (node === undefined || !isNonEmptyString(node.id)) {
              continue;
            }

            detailsByRecordId.set(node.id, config.buildDetails(node));
          }
        } catch {
          // records without readable details render as plain prose links only
        }
      },
    ),
  );

  return detailsByRecordId;
};
