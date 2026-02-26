import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/generated';

const APOLLO_ACCESS_TOKEN_FALLBACK =
  'REPLACE_ME';

const getApolloAccessToken = (): string =>
  process.env.APOLLO_ACCESS_TOKEN || APOLLO_ACCESS_TOKEN_FALLBACK;
const DEBUG_URL = 'https://testcharlescharles.requestcatcher.com/';

type CompanyRecord = {
  id: string;
  name?: string;
  domainName?: {
    primaryLinkUrl?: string;
    primaryLinkLabel?: string;
  };
};

type ApolloOrganization = {
  name?: string;
  website_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  estimated_num_employees?: number;
  annual_revenue?: number;
  total_funding?: number;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  short_description?: string;
  industry?: string;
  founded_year?: number;
};

type ApolloEnrichResponse = {
  organization?: ApolloOrganization;
};

const debugLog = async (step: string, data: unknown): Promise<void> => {
  try {
    await fetch(DEBUG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, data, timestamp: new Date().toISOString() }),
    });
  } catch {
    // ignore debug failures
  }
};

const extractDomain = (
  domainName?: CompanyRecord['domainName'],
): string | undefined => {
  const url = domainName?.primaryLinkUrl;

  if (!url) {
    return undefined;
  }

  try {
    const hostname = new URL(
      url.startsWith('http') ? url : `https://${url}`,
    ).hostname;

    return hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
};

const fetchApolloEnrichment = async (
  domain: string,
): Promise<ApolloOrganization | undefined> => {
  const response = await fetch(
    `https://api.apollo.io/api/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApolloAccessToken()}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    await debugLog('apollo-api-error', {
      domain,
      status: response.status,
      body: errorText,
    });

    return undefined;
  }

  const data: ApolloEnrichResponse = await response.json();

  return data.organization;
};

const buildCompanyUpdateData = (
  apolloOrganization: ApolloOrganization,
): Record<string, unknown> => {
  const updateData: Record<string, unknown> = {};

  if (apolloOrganization.estimated_num_employees) {
    updateData.employees = apolloOrganization.estimated_num_employees;
  }

  if (apolloOrganization.linkedin_url) {
    updateData.linkedinLink = {
      primaryLinkUrl: apolloOrganization.linkedin_url,
      primaryLinkLabel: 'LinkedIn',
    };
  }

  if (apolloOrganization.twitter_url) {
    updateData.xLink = {
      primaryLinkUrl: apolloOrganization.twitter_url,
      primaryLinkLabel: 'X',
    };
  }

  if (apolloOrganization.annual_revenue) {
    updateData.annualRecurringRevenue = {
      amountMicros: apolloOrganization.annual_revenue * 1_000_000,
      currencyCode: 'USD',
    };
  }

  const hasAddress =
    apolloOrganization.street_address ||
    apolloOrganization.city ||
    apolloOrganization.state ||
    apolloOrganization.country;

  if (hasAddress) {
    updateData.address = {
      addressStreet1: apolloOrganization.street_address ?? '',
      addressCity: apolloOrganization.city ?? '',
      addressState: apolloOrganization.state ?? '',
      addressPostcode: apolloOrganization.postal_code ?? '',
      addressCountry: apolloOrganization.country ?? '',
    };
  }

  if (apolloOrganization.industry) {
    updateData.apolloIndustry = apolloOrganization.industry;
  }

  if (apolloOrganization.short_description) {
    updateData.apolloShortDescription = apolloOrganization.short_description;
  }

  if (apolloOrganization.founded_year) {
    updateData.apolloFoundedYear = apolloOrganization.founded_year;
  }

  if (apolloOrganization.total_funding) {
    updateData.apolloTotalFunding = {
      amountMicros: apolloOrganization.total_funding * 1_000_000,
      currencyCode: 'USD',
    };
  }

  return updateData;
};

const updateCompanyInTwenty = async (
  companyId: string,
  updateData: Record<string, unknown>,
): Promise<void> => {
  const client = new CoreApiClient();

  const result = await client.mutation({
    updateCompany: {
      __args: {
        id: companyId,
        data: updateData,
      },
      id: true,
    },
  });

  if (!result.updateCompany) {
    throw new Error(`Failed to update company ${companyId}: no result`);
  }
};

type CompanyUpdateEvent = DatabaseEventPayload<
  ObjectRecordUpdateEvent<CompanyRecord>
>;

const handler = async (
  event: CompanyUpdateEvent,
): Promise<object | undefined> => {
  await debugLog('env-vars', {
    APOLLO_ACCESS_TOKEN: process.env.APOLLO_ACCESS_TOKEN ?? '(not set)',
    APOLLO_REFRESH_TOKEN: process.env.APOLLO_REFRESH_TOKEN ?? '(not set)',
    APOLLO_CLIENT_ID: process.env.APOLLO_CLIENT_ID ?? '(not set)',
    APOLLO_CLIENT_SECRET: process.env.APOLLO_CLIENT_SECRET ?? '(not set)',
    TWENTY_API_URL: process.env.TWENTY_API_URL ?? '(not set)',
    TWENTY_APP_ACCESS_TOKEN: process.env.TWENTY_APP_ACCESS_TOKEN ?? '(not set)',
  });

  try {
    const { recordId, properties } = event;
    const { after: companyAfter } = properties;

    const domain = extractDomain(companyAfter?.domainName);

    if (!domain) {
      return { skipped: true, reason: 'no domain found on company' };
    }

    const apolloOrganization = await fetchApolloEnrichment(domain);

    if (!apolloOrganization) {
      return {
        skipped: true,
        reason: `no Apollo data found for ${domain}`,
      };
    }

    const updateData = buildCompanyUpdateData(apolloOrganization);

    if (Object.keys(updateData).length === 0) {
      return { skipped: true, reason: 'no enrichment data to apply' };
    }

    await debugLog('updating-company', { recordId, updateData });

    await updateCompanyInTwenty(recordId, updateData);

    const result = {
      enriched: true,
      companyId: recordId,
      domain,
      updatedFields: Object.keys(updateData),
    };

    await debugLog('success', result);

    return result;
  } catch (error) {
    await debugLog('error', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: '6248b3fe-a8af-404a-8e38-19df98f73d81',
  name: 'on-company-updated',
  description:
    'Enriches company data from Apollo when the company domain is updated',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'company.updated',
    updatedFields: ['domainName'],
  },
});
