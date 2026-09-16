import { isDefined } from 'twenty-sdk/utils';

import {
  readCompanyDomain,
  readCompanyName,
} from 'src/logic-functions/data/company-key.util';
import {
  type Organization,
  type Person,
} from 'src/logic-functions/types/google-response.type';

export const readGoogleOrganization = (
  person: Person,
): Organization | undefined => {
  const organization = person.organizations?.[0];
  const name = readCompanyName(organization?.name);
  const domain = readCompanyDomain(organization?.domain);

  if (!isDefined(name) && !isDefined(domain)) {
    return undefined;
  }

  return {
    ...(isDefined(name) ? { name } : {}),
    ...(isDefined(domain) ? { domain } : {}),
  };
};
