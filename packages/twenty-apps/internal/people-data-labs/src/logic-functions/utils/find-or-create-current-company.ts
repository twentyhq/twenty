import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildCompanyCreateData } from 'src/logic-functions/utils/build-company-create-data';
import { buildCompanyMatchKeys } from 'src/logic-functions/utils/build-company-match-keys';
import { findCompanyId } from 'src/logic-functions/utils/find-company-id';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { isDefined } from 'src/utils/is-defined';
import { isUniqueViolationError } from 'src/utils/is-unique-violation-error';

type CreateCompanyResult = { createCompany?: { id?: string } };

export const findOrCreateCurrentCompany = async (
  client: CoreApiClient,
  data: PdlPersonData,
): Promise<string | undefined> => {
  const matchKeys = buildCompanyMatchKeys(data);

  if (
    !isNonEmptyString(matchKeys.name) &&
    !isNonEmptyString(matchKeys.website)
  ) {
    return undefined;
  }

  const existingId = await findCompanyId(client, matchKeys);
  if (isDefined(existingId)) {
    return existingId;
  }

  try {
    const result = (await client.mutation({
      createCompany: {
        __args: { data: buildCompanyCreateData(data) },
        id: true,
      },
    })) as CreateCompanyResult;

    const companyId = result.createCompany?.id;

    if (!isDefined(companyId)) {
      throw new Error('Failed to create company: no id returned.');
    }

    return companyId;
  } catch (createError) {
    if (!isUniqueViolationError(createError)) {
      throw createError;
    }

    const raceWinnerId = await findCompanyId(client, matchKeys);
    if (isDefined(raceWinnerId)) {
      return raceWinnerId;
    }

    throw createError;
  }
};
