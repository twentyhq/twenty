import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildCompanyCreateData } from 'src/logic-functions/utils/build-company-create-data';
import { buildCompanyMatchKeys } from 'src/logic-functions/utils/build-company-match-keys';
import { findCompanyId } from 'src/logic-functions/utils/find-company-id';
import { type CompanyIdByMatchKeyCache } from 'src/types/company-id-by-match-key-cache';
import { type CompanyMatchKeys } from 'src/types/company-match-keys';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { isDefined } from 'src/utils/is-defined';
import { isUniqueViolationError } from 'src/utils/is-unique-violation-error';

type CreateCompanyResult = { createCompany?: { id?: string } };

const findOrCreateUncachedCompany = async ({
  client,
  personData,
  companyMatchKeys,
}: {
  client: CoreApiClient;
  personData: PdlPersonData;
  companyMatchKeys: CompanyMatchKeys;
}): Promise<string | undefined> => {
  const existingCompanyId = await findCompanyId({
    client,
    matchKeys: companyMatchKeys,
  });
  if (isDefined(existingCompanyId)) {
    return existingCompanyId;
  }

  const canCreateNewCompany =
    isNonEmptyString(companyMatchKeys.name) ||
    isNonEmptyString(companyMatchKeys.website);

  if (!canCreateNewCompany) {
    return undefined;
  }

  try {
    const createCompanyResult = (await client.mutation({
      createCompany: {
        __args: { data: buildCompanyCreateData(personData) },
        id: true,
      },
    })) as CreateCompanyResult;

    const createdCompanyId = createCompanyResult.createCompany?.id;

    if (!isDefined(createdCompanyId)) {
      throw new Error('Failed to create company: no id returned.');
    }

    return createdCompanyId;
  } catch (createCompanyError) {
    if (!isUniqueViolationError(createCompanyError)) {
      throw createCompanyError;
    }

    const raceWinnerCompanyId = await findCompanyId({
      client,
      matchKeys: companyMatchKeys,
    });
    if (isDefined(raceWinnerCompanyId)) {
      return raceWinnerCompanyId;
    }

    throw createCompanyError;
  }
};

export const findOrCreateCurrentCompany = async ({
  client,
  personData,
  companyIdByMatchKeyCache,
}: {
  client: CoreApiClient;
  personData: PdlPersonData;
  companyIdByMatchKeyCache: CompanyIdByMatchKeyCache;
}): Promise<string | undefined> => {
  const companyMatchKeys = buildCompanyMatchKeys(personData);

  const hasAnyCompanyMatchKey =
    isNonEmptyString(companyMatchKeys.pdlId) ||
    isNonEmptyString(companyMatchKeys.website) ||
    isNonEmptyString(companyMatchKeys.linkedinUrl) ||
    isNonEmptyString(companyMatchKeys.name);

  if (!hasAnyCompanyMatchKey) {
    return undefined;
  }

  const companyMatchKeyCacheKey = JSON.stringify(companyMatchKeys);
  if (companyIdByMatchKeyCache.has(companyMatchKeyCacheKey)) {
    return companyIdByMatchKeyCache.get(companyMatchKeyCacheKey);
  }

  const resolvedCompanyId = await findOrCreateUncachedCompany({
    client,
    personData,
    companyMatchKeys,
  });

  companyIdByMatchKeyCache.set(companyMatchKeyCacheKey, resolvedCompanyId);

  return resolvedCompanyId;
};
