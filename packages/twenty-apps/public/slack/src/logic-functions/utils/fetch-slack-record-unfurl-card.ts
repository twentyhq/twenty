import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { type SlackRecordUnfurlCard } from 'src/logic-functions/types/slack-record-unfurl-card.type';
import { buildSlackRecordUnfurlCardFields } from 'src/logic-functions/utils/build-slack-record-unfurl-card-fields';
import { formatSlackUnfurlCurrencyAmount } from 'src/logic-functions/utils/format-slack-unfurl-currency-amount';
import { formatSlackUnfurlDate } from 'src/logic-functions/utils/format-slack-unfurl-date';
import { formatSlackUnfurlSelectValue } from 'src/logic-functions/utils/format-slack-unfurl-select-value';

type FullNameValue = {
  firstName?: string | null;
  lastName?: string | null;
};

type CurrencyValue = {
  amountMicros?: unknown;
  currencyCode?: string | null;
};

type PersonUnfurlRecord = {
  name?: FullNameValue | null;
  jobTitle?: string | null;
  emails?: { primaryEmail?: string | null } | null;
  company?: { name?: string | null } | null;
};

type CompanyUnfurlRecord = {
  name?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
  address?: { addressCity?: string | null } | null;
  annualRevenue?: CurrencyValue | null;
};

type OpportunityUnfurlRecord = {
  name?: string | null;
  stage?: string | null;
  amount?: CurrencyValue | null;
  closeDate?: string | null;
  company?: { name?: string | null } | null;
};

type NoteUnfurlRecord = {
  title?: string | null;
  createdAt?: string | null;
  createdBy?: { name?: string | null } | null;
};

type TaskUnfurlRecord = {
  title?: string | null;
  status?: string | null;
  dueAt?: string | null;
  assignee?: { name?: FullNameValue | null } | null;
};

// The generated CoreApiClient is untyped at build time (its schema is
// generated per workspace on install); the workspace GraphQL API validates
// the query at runtime, so this is the one place the result is trusted to
// match the declared selection.
const coreQuery = async <TResult>(
  queryInput: Record<string, unknown>,
): Promise<TResult | null | undefined> => {
  const client = new CoreApiClient() as {
    query: (
      input: Record<string, unknown>,
    ) => Promise<TResult | null | undefined>;
  };

  return await client.query(queryInput);
};

const buildRecordFilterArgs = (recordId: string) => ({
  filter: { id: { eq: recordId } },
});

const buildFullName = (name: FullNameValue | null | undefined): string =>
  [name?.firstName, name?.lastName].filter(isNonEmptyString).join(' ');

const fetchPersonUnfurlCard = async (
  recordId: string,
): Promise<SlackRecordUnfurlCard | undefined> => {
  const result = await coreQuery<{ person?: PersonUnfurlRecord | null }>({
    person: {
      __args: buildRecordFilterArgs(recordId),
      name: { firstName: true, lastName: true },
      jobTitle: true,
      emails: { primaryEmail: true },
      company: { name: true },
    },
  });
  const person = result?.person;

  if (!isDefined(person)) {
    return undefined;
  }

  return {
    objectLabel: 'Person',
    recordTitle: buildFullName(person.name) || 'Person',
    fields: buildSlackRecordUnfurlCardFields([
      ['Company', person.company?.name],
      ['Job title', person.jobTitle],
      ['Email', person.emails?.primaryEmail],
    ]),
  };
};

const fetchCompanyUnfurlCard = async (
  recordId: string,
): Promise<SlackRecordUnfurlCard | undefined> => {
  const result = await coreQuery<{ company?: CompanyUnfurlRecord | null }>({
    company: {
      __args: buildRecordFilterArgs(recordId),
      name: true,
      domainName: { primaryLinkUrl: true },
      address: { addressCity: true },
      annualRevenue: { amountMicros: true, currencyCode: true },
    },
  });
  const company = result?.company;

  if (!isDefined(company)) {
    return undefined;
  }

  return {
    objectLabel: 'Company',
    recordTitle: isNonEmptyString(company.name) ? company.name : 'Company',
    fields: buildSlackRecordUnfurlCardFields([
      ['Domain', company.domainName?.primaryLinkUrl],
      ['City', company.address?.addressCity],
      [
        'ARR',
        isDefined(company.annualRevenue)
          ? formatSlackUnfurlCurrencyAmount(company.annualRevenue)
          : undefined,
      ],
    ]),
  };
};

const fetchOpportunityUnfurlCard = async (
  recordId: string,
): Promise<SlackRecordUnfurlCard | undefined> => {
  const result = await coreQuery<{
    opportunity?: OpportunityUnfurlRecord | null;
  }>({
    opportunity: {
      __args: buildRecordFilterArgs(recordId),
      name: true,
      stage: true,
      amount: { amountMicros: true, currencyCode: true },
      closeDate: true,
      company: { name: true },
    },
  });
  const opportunity = result?.opportunity;

  if (!isDefined(opportunity)) {
    return undefined;
  }

  return {
    objectLabel: 'Opportunity',
    recordTitle: isNonEmptyString(opportunity.name)
      ? opportunity.name
      : 'Opportunity',
    fields: buildSlackRecordUnfurlCardFields([
      [
        'Stage',
        isNonEmptyString(opportunity.stage)
          ? formatSlackUnfurlSelectValue(opportunity.stage)
          : undefined,
      ],
      [
        'Amount',
        isDefined(opportunity.amount)
          ? formatSlackUnfurlCurrencyAmount(opportunity.amount)
          : undefined,
      ],
      [
        'Close date',
        isNonEmptyString(opportunity.closeDate)
          ? formatSlackUnfurlDate(opportunity.closeDate)
          : undefined,
      ],
      ['Company', opportunity.company?.name],
    ]),
  };
};

const fetchNoteUnfurlCard = async (
  recordId: string,
): Promise<SlackRecordUnfurlCard | undefined> => {
  const result = await coreQuery<{ note?: NoteUnfurlRecord | null }>({
    note: {
      __args: buildRecordFilterArgs(recordId),
      title: true,
      createdAt: true,
      createdBy: { name: true },
    },
  });
  const note = result?.note;

  if (!isDefined(note)) {
    return undefined;
  }

  return {
    objectLabel: 'Note',
    recordTitle: isNonEmptyString(note.title) ? note.title : 'Note',
    fields: buildSlackRecordUnfurlCardFields([
      [
        'Created',
        isNonEmptyString(note.createdAt)
          ? formatSlackUnfurlDate(note.createdAt)
          : undefined,
      ],
      ['Created by', note.createdBy?.name],
    ]),
  };
};

const fetchTaskUnfurlCard = async (
  recordId: string,
): Promise<SlackRecordUnfurlCard | undefined> => {
  const result = await coreQuery<{ task?: TaskUnfurlRecord | null }>({
    task: {
      __args: buildRecordFilterArgs(recordId),
      title: true,
      status: true,
      dueAt: true,
      assignee: { name: { firstName: true, lastName: true } },
    },
  });
  const task = result?.task;

  if (!isDefined(task)) {
    return undefined;
  }

  return {
    objectLabel: 'Task',
    recordTitle: isNonEmptyString(task.title) ? task.title : 'Task',
    fields: buildSlackRecordUnfurlCardFields([
      [
        'Status',
        isNonEmptyString(task.status)
          ? formatSlackUnfurlSelectValue(task.status)
          : undefined,
      ],
      [
        'Due date',
        isNonEmptyString(task.dueAt)
          ? formatSlackUnfurlDate(task.dueAt)
          : undefined,
      ],
      [
        'Assignee',
        isDefined(task.assignee)
          ? buildFullName(task.assignee.name)
          : undefined,
      ],
    ]),
  };
};

export const fetchSlackRecordUnfurlCard = async ({
  objectNameSingular,
  recordId,
}: SlackRecordLink): Promise<SlackRecordUnfurlCard | undefined> => {
  try {
    switch (objectNameSingular) {
      case 'person':
        return await fetchPersonUnfurlCard(recordId);
      case 'company':
        return await fetchCompanyUnfurlCard(recordId);
      case 'opportunity':
        return await fetchOpportunityUnfurlCard(recordId);
      case 'note':
        return await fetchNoteUnfurlCard(recordId);
      case 'task':
        return await fetchTaskUnfurlCard(recordId);
      default:
        return undefined;
    }
  } catch (error) {
    console.warn(
      `[slack] skipping unfurl for ${objectNameSingular} ${recordId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
