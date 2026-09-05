import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useShareableRoles } from '@/record-share/hooks/useShareableRoles';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  RecordSharePrincipalType,
  type SharingRule,
} from '~/generated-metadata/graphql';

export const useSharingRuleGranteeLabel = () => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { roles } = useShareableRoles();

  const getSharingRuleGranteeLabel = (
    sharingRule: Pick<
      SharingRule,
      'granteePrincipalType' | 'granteeRoleId' | 'granteePrincipalId'
    >,
  ): string => {
    switch (sharingRule.granteePrincipalType) {
      case RecordSharePrincipalType.EVERYONE:
        return t`Everyone`;
      case RecordSharePrincipalType.ROLE:
        return (
          roles.find((role) => role.id === sharingRule.granteeRoleId)?.label ??
          t`Role`
        );
      case RecordSharePrincipalType.WORKSPACE_MEMBER: {
        const workspaceMember = currentWorkspaceMembers.find(
          (member) => member.id === sharingRule.granteePrincipalId,
        );

        return workspaceMember
          ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
          : t`Member`;
      }
      default:
        return '';
    }
  };

  return { getSharingRuleGranteeLabel };
};
