import { isNonEmptyString } from '@sniptt/guards';

import { buildCompanyKey } from 'src/logic-functions/data/company-key.util';
import { type ResolvedPerson } from 'src/logic-functions/data/resolve-people-to-upsert.util';
import { type PersonToUpsert } from 'src/logic-functions/types/twenty-person.type';

export const attachCompanyIds = ({
  resolvedPeople,
  companyIdsByKey,
}: {
  resolvedPeople: ResolvedPerson[];
  companyIdsByKey: Map<string, string>;
}): PersonToUpsert[] =>
  resolvedPeople.map(({ personInput, organization }) => {
    const companyKey = buildCompanyKey(organization);
    const companyId = isNonEmptyString(companyKey)
      ? companyIdsByKey.get(companyKey)
      : undefined;

    return isNonEmptyString(companyId)
      ? { ...personInput, companyId }
      : personInput;
  });
