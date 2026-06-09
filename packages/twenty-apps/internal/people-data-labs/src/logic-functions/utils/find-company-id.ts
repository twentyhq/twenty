import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCompanyIdByFilter } from 'src/logic-functions/utils/find-company-id-by-filter';
import { type CompanyMatchKeys } from 'src/types/company-match-keys';
import { isDefined } from 'src/utils/is-defined';

export const findCompanyId = async ({
  client,
  matchKeys,
}: {
  client: CoreApiClient;
  matchKeys: CompanyMatchKeys;
}): Promise<string | undefined> => {
  const { pdlId, website, linkedinUrl, name } = matchKeys;

  if (isNonEmptyString(pdlId)) {
    const matchById = await findCompanyIdByFilter({
      client,
      filter: { pdlId: { eq: pdlId } },
    });
    if (isDefined(matchById)) {
      return matchById;
    }
  }

  if (isNonEmptyString(website)) {
    const matchByDomain = await findCompanyIdByFilter({
      client,
      filter: { domainName: { primaryLinkUrl: { eq: website } } },
    });
    if (isDefined(matchByDomain)) {
      return matchByDomain;
    }
  }

  if (isNonEmptyString(linkedinUrl)) {
    const matchByLinkedin = await findCompanyIdByFilter({
      client,
      filter: { linkedinLink: { primaryLinkUrl: { eq: linkedinUrl } } },
    });
    if (isDefined(matchByLinkedin)) {
      return matchByLinkedin;
    }
  }

  if (isNonEmptyString(name)) {
    const matchByName = await findCompanyIdByFilter({
      client,
      filter: { name: { eq: name } },
      requireUnique: true,
    });
    if (isDefined(matchByName)) {
      return matchByName;
    }
  }

  return undefined;
};
