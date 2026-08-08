import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { formatSlackRecordAmount } from 'src/logic-functions/utils/format-slack-record-amount';
import { formatSlackRecordDate } from 'src/logic-functions/utils/format-slack-record-date';
import { formatSlackRecordSelectValue } from 'src/logic-functions/utils/format-slack-record-select-value';

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

const buildCurrencyLine = (
  label: string,
  currencyValue: CurrencyValue | null | undefined,
): string | undefined => {
  const rawAmountMicros = currencyValue?.amountMicros;

  if (rawAmountMicros === null || rawAmountMicros === undefined) {
    return undefined;
  }

  const amountMicros = Number(rawAmountMicros);

  if (!Number.isFinite(amountMicros)) {
    return undefined;
  }

  return `${label}: ${formatSlackRecordAmount({
    amountMicros,
    currencyCode: currencyValue?.currencyCode ?? undefined,
  })}`;
};

const buildDateLine = (
  label: string,
  isoDate: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(isoDate)) {
    return undefined;
  }

  const formattedDate = formatSlackRecordDate(isoDate);

  return formattedDate === undefined ? undefined : `${label}: ${formattedDate}`;
};

const buildSelectLine = (
  label: string,
  value: string | null | undefined,
): string | undefined =>
  isNonEmptyString(value)
    ? `${label}: ${formatSlackRecordSelectValue(value)}`
    : undefined;

const buildTextLine = (
  label: string,
  value: string | null | undefined,
): string | undefined =>
  isNonEmptyString(value) ? `${label}: ${value}` : undefined;

// headline fields per standard object; custom objects fall back to a bare card
const RECORD_CARD_QUERY_CONFIGS: Record<
  string,
  {
    queryFieldName: string;
    selection: object;
    buildFieldLines: (node: RecordNode) => (string | undefined)[];
  }
> = {
  opportunity: {
    queryFieldName: 'opportunities',
    selection: {
      stage: true,
      amount: { amountMicros: true, currencyCode: true },
      closeDate: true,
    },
    buildFieldLines: (node) => [
      buildSelectLine('Stage', node.stage),
      buildCurrencyLine('Amount', node.amount),
      buildDateLine('Close date', node.closeDate),
    ],
  },
  company: {
    queryFieldName: 'companies',
    selection: {
      domainName: { primaryLinkUrl: true },
      annualRevenue: { amountMicros: true, currencyCode: true },
    },
    buildFieldLines: (node) => [
      buildTextLine('Domain', node.domainName?.primaryLinkUrl),
      buildCurrencyLine('Annual revenue', node.annualRevenue),
    ],
  },
  person: {
    queryFieldName: 'people',
    selection: {
      jobTitle: true,
      emails: { primaryEmail: true },
      company: { name: true },
    },
    buildFieldLines: (node) => [
      buildTextLine('Role', node.jobTitle),
      buildTextLine('Email', node.emails?.primaryEmail),
      buildTextLine('Company', node.company?.name),
    ],
  },
  task: {
    queryFieldName: 'tasks',
    selection: {
      status: true,
      dueAt: true,
    },
    buildFieldLines: (node) => [
      buildSelectLine('Status', node.status),
      buildDateLine('Due', node.dueAt),
    ],
  },
};

export const fetchSlackRecordCardFieldLines = async (
  client: CoreApiClient,
  references: SlackRecordReference[],
): Promise<Map<string, string[]>> => {
  const fieldLinesByRecordId = new Map<string, string[]>();

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
        const config = RECORD_CARD_QUERY_CONFIGS[objectNameSingular];

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

            fieldLinesByRecordId.set(
              node.id,
              config.buildFieldLines(node).filter(isNonEmptyString),
            );
          }
        } catch {
          // cards degrade to name and link when headline fields cannot be read
        }
      },
    ),
  );

  return fieldLinesByRecordId;
};
