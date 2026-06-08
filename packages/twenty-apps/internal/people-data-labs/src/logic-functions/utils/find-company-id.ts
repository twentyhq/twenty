import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCompanyIdByFilter } from 'src/logic-functions/utils/find-company-id-by-filter';
import { type CompanyMatchKeys } from 'src/types/company-match-keys';
import { isDefined } from 'src/utils/is-defined';

export const findCompanyId = async (
  client: CoreApiClient,
  { pdlId, website, linkedinUrl, name }: CompanyMatchKeys,
): Promise<string | undefined> => {
  if (isNonEmptyString(pdlId)) {
    const matchById = await findCompanyIdByFilter(client, {
      pdlId: { eq: pdlId },
    });
    if (isDefined(matchById)) {
      return matchById;
    }
  }

  if (isNonEmptyString(website)) {
    const matchByDomain = await findCompanyIdByFilter(client, {
      domainName: { primaryLinkUrl: { eq: website } },
    });
    if (isDefined(matchByDomain)) {
      return matchByDomain;
    }
  }

  if (isNonEmptyString(linkedinUrl)) {
    const matchByLinkedin = await findCompanyIdByFilter(client, {
      linkedinLink: { primaryLinkUrl: { eq: linkedinUrl } },
    });
    if (isDefined(matchByLinkedin)) {
      return matchByLinkedin;
    }
  }

  if (isNonEmptyString(name)) {
    const matchByName = await findCompanyIdByFilter(client, {
      name: { eq: name },
    });
    if (isDefined(matchByName)) {
      return matchByName;
    }
  }

  return undefined;
};
