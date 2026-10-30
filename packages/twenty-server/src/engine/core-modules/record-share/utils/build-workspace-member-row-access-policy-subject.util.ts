/* @license Enterprise */

import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const buildWorkspaceMemberRowAccessPolicySubject = ({
  workspaceMemberId,
  ...roleSubjectArguments
}: Parameters<typeof buildRoleRowAccessPolicySubject>[0] & {
  workspaceMemberId: string;
}): RowAccessPolicySubject => {
  const roleSubject = buildRoleRowAccessPolicySubject(roleSubjectArguments);

  return {
    ...roleSubject,
    principalIds: [...(roleSubject.principalIds ?? []), workspaceMemberId],
  };
};
