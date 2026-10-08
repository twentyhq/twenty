/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';

import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

// Only a grant naming the member or one of their roles reaches beyond the
// role: general access goes as far as the people who can access the object
export const resolveNamedPrincipalIds = (
  subject: Pick<RowAccessPolicySubject, 'principalIds'>,
): string[] =>
  (subject.principalIds ?? []).filter(
    (principalId) => principalId !== EVERYONE_PRINCIPAL_ID,
  );
