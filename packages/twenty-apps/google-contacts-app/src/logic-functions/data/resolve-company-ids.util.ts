import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';
import { chunk } from 'src/logic-functions/data/chunk.util';
import {
  buildCompanyKey,
  buildDomainKey,
  buildNameKey,
  readCompanyDomain,
  readCompanyName,
} from 'src/logic-functions/data/company-key.util';
import { describeError } from 'src/logic-functions/data/describe-error.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';
import { queryEdgesInBatches } from 'src/logic-functions/data/query-edges-in-batches.util';
import { type Organization } from 'src/logic-functions/types/google-response.type';

const COMPANY_LOOKUP_CHUNK_SIZE = 50;

type FoundCompany = {
  id: string;
  name?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
};

const escapeForIlike = (value: string): string =>
  value.replace(/[\\%_]/g, (character) => `\\${character}`);

const registerCompany = (
  companyIdsByKey: Map<string, string>,
  company: FoundCompany,
): void => {
  const domain = readCompanyDomain(company.domainName?.primaryLinkUrl);
  const name = readCompanyName(company.name);

  if (
    isNonEmptyString(domain) &&
    !companyIdsByKey.has(buildDomainKey(domain))
  ) {
    companyIdsByKey.set(buildDomainKey(domain), company.id);
  }

  if (isNonEmptyString(name) && !companyIdsByKey.has(buildNameKey(name))) {
    companyIdsByKey.set(buildNameKey(name), company.id);
  }
};

const findCompanies = (
  client: CoreApiClient,
  filters: Record<string, unknown>[],
): Promise<FoundCompany[]> =>
  queryEdgesInBatches(
    filters,
    async (filtersBatch) => {
      const { companies } = await client.query({
        companies: {
          __args: { filter: { or: filtersBatch }, first: BATCH_SIZE },
          edges: {
            node: {
              id: true,
              name: true,
              domainName: { primaryLinkUrl: true },
            },
          },
        },
      });

      return companies;
    },
    COMPANY_LOOKUP_CHUNK_SIZE,
  );

const createCompaniesBatch = async (
  client: CoreApiClient,
  organizations: Organization[],
): Promise<FoundCompany[]> => {
  const { createCompanies } = await executeWithRetry(() =>
    client.mutation({
      createCompanies: {
        __args: {
          data: organizations.map((organization) => ({
            name: organization.name,
            ...(isNonEmptyString(organization.domain)
              ? {
                  domainName: {
                    primaryLinkUrl: `https://${organization.domain}`,
                  },
                }
              : {}),
          })),
        },
        id: true,
        name: true,
        domainName: { primaryLinkUrl: true },
      },
    }),
  );

  return createCompanies ?? [];
};

const createMissingCompanies = async (
  client: CoreApiClient,
  companyIdsByKey: Map<string, string>,
  organizations: Organization[],
): Promise<void> => {
  for (const organizationsBatch of chunk(organizations, BATCH_SIZE)) {
    let createdCompanies: FoundCompany[];

    try {
      createdCompanies = await createCompaniesBatch(client, organizationsBatch);
    } catch (error) {
      console.error(
        '[google-contacts] Failed to create a batch of companies',
        describeError(error),
      );

      for (const organization of organizationsBatch) {
        try {
          for (const company of await createCompaniesBatch(client, [
            organization,
          ])) {
            registerCompany(companyIdsByKey, company);
          }
        } catch (singleError) {
          console.error(
            '[google-contacts] Failed to create a company',
            organization.name,
            describeError(singleError),
          );
        }
      }

      continue;
    }

    for (const company of createdCompanies) {
      registerCompany(companyIdsByKey, company);
    }
  }
};

export const resolveCompanyIds = async ({
  client,
  organizations,
}: {
  client: CoreApiClient;
  organizations: Organization[];
}): Promise<Map<string, string>> => {
  const organizationsByKey = new Map<string, Organization>();

  for (const organization of organizations) {
    const key = buildCompanyKey(organization);

    if (isDefined(key) && !organizationsByKey.has(key)) {
      organizationsByKey.set(key, organization);
    }
  }

  const companyIdsByKey = new Map<string, string>();

  if (organizationsByKey.size === 0) {
    return companyIdsByKey;
  }

  const wanted = [...organizationsByKey.values()];

  const domainFilters = wanted
    .map(({ domain }) => domain)
    .filter(isNonEmptyString)
    .map((domain) => ({
      domainName: { primaryLinkUrl: { ilike: `%${escapeForIlike(domain)}%` } },
    }));
  const nameFilters = wanted
    .map(({ name }) => name)
    .filter(isNonEmptyString)
    .map((name) => ({ name: { ilike: escapeForIlike(name) } }));

  for (const company of [
    ...(await findCompanies(client, domainFilters)),
    ...(await findCompanies(client, nameFilters)),
  ]) {
    registerCompany(companyIdsByKey, company);
  }

  const organizationsToCreate: Organization[] = [];
  const claimedNames = new Set<string>();

  for (const [key, organization] of organizationsByKey) {
    if (companyIdsByKey.has(key)) {
      continue;
    }

    const name = readCompanyName(organization.name);

    if (!isNonEmptyString(name)) {
      continue;
    }

    const nameKey = buildNameKey(name);
    const companyMatchedOnName = companyIdsByKey.get(nameKey);

    // A domain-keyed organization still falls back to the name match, otherwise
    // an existing Company with no website would be duplicated.
    if (isNonEmptyString(companyMatchedOnName)) {
      companyIdsByKey.set(key, companyMatchedOnName);

      continue;
    }

    if (claimedNames.has(nameKey)) {
      continue;
    }

    claimedNames.add(nameKey);
    organizationsToCreate.push(organization);
  }

  await createMissingCompanies(client, companyIdsByKey, organizationsToCreate);

  return companyIdsByKey;
};
