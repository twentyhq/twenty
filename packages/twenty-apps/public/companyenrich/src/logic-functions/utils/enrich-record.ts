import { CompanyEnrichError } from './companyenrich-error';
import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  queryCompanyEnrich,
  type ResearchResult,
} from './companyenrich-client';

type RecordKind = 'company' | 'person';
type RecordInput = { recordId: string };
type RecordSnapshot = {
  id: string;
  updatedAt: string;
  domainName?: { primaryLinkUrl?: string | null } | null;
  emails?: { primaryEmail?: string | null } | null;
};

export const enrichRecord = async (
  kind: RecordKind,
  input: RecordInput,
  client: Pick<CoreApiClient, 'query' | 'mutation'> = new CoreApiClient(),
  query = queryCompanyEnrich,
): Promise<ResearchResult & { recordId: string; updatedFields: string[] }> => {
  if (
    !input ||
    typeof input.recordId !== 'string' ||
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(input.recordId)
  ) {
    throw new CompanyEnrichError('Provide a valid Twenty record ID.');
  }

  const collection = kind === 'company' ? 'companies' : 'people';
  const records = (await client.query({
    [collection]: {
      __args: { filter: { id: { eq: input.recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          updatedAt: true,
          ...(kind === 'company'
            ? { domainName: { primaryLinkUrl: true } }
            : { emails: { primaryEmail: true } }),
        },
      },
    },
  })) as Record<string, { edges?: { node: RecordSnapshot }[] }>;
  const record = records[collection]?.edges?.[0]?.node;

  if (!record?.id || !record.updatedAt) {
    throw new CompanyEnrichError(
      'Record not found or access denied. No CompanyEnrich request was made.',
    );
  }

  const identifier =
    kind === 'company'
      ? record.domainName?.primaryLinkUrl
      : record.emails?.primaryEmail;

  if (!identifier) {
    throw new CompanyEnrichError(
      kind === 'company'
        ? 'The company needs a website before enrichment.'
        : 'The person needs a known email address before lookup.',
    );
  }

  const result = await query(
    kind === 'company' ? 'enrich-company' : 'lookup-person',
    kind === 'company'
      ? { domain: identifier }
      : { body: { email: identifier } },
  );

  if (!isObject(result.data) || !('id' in result.data) || !result.data.id) {
    throw new CompanyEnrichError(
      'CompanyEnrich returned no identifiable profile. Nothing was saved.',
    );
  }

  const data: Record<string, unknown> = {
    companyenrichData: result.data,
    companyenrichId: String(result.data.id),
    companyenrichEnrichedAt: new Date().toISOString(),
  };
  const summaryFields: Record<string, string> =
    kind === 'company'
      ? {
          companyenrichIndustry: 'industry',
          companyenrichEmployeeRange: 'employees',
        }
      : {
          companyenrichPosition: 'position',
          companyenrichDepartment: 'department',
        };

  for (const [field, providerField] of Object.entries(summaryFields)) {
    const value = (result.data as Record<string, unknown>)[providerField];
    data[field] = typeof value === 'string' ? value : null;
  }

  const mutation = kind === 'company' ? 'updateCompanies' : 'updatePeople';
  const updated = (await client.mutation({
    [mutation]: {
      __args: {
        filter: { id: { eq: record.id }, updatedAt: { eq: record.updatedAt } },
        data,
      },
      id: true,
    },
  })) as Record<string, { id: string }[]>;

  if (!updated[mutation]?.some((entry) => entry.id === record.id)) {
    throw new CompanyEnrichError(
      'The CRM record changed during enrichment. Nothing was saved. The provider request may have consumed credits; review usage before retrying.',
    );
  }

  return { ...result, recordId: record.id, updatedFields: Object.keys(data) };
};
