import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconArrowUpRight,
  IconUser,
  useIcons,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useUpdateWorkspaceMemberRoleMutation } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const CONFIRM_ROLE_CHANGE_MODAL_ID = 'confirm-role-change-modal';

const StyledNoRoleContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledRoleContainer = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledRoleSelector = styled.div`
  flex: 1;
`;

type MemberPermissionsTabProps = {
  member: WorkspaceMember;
  roles: RoleWithPartialMembers[];
  allRoles: RoleWithPartialMembers[];
};

export const MemberPermissionsTab = ({
  member,
  roles,
  allRoles,
}: MemberPermissionsTabProps) => {
  const primaryRole = roles?.[0];
  const { getIcon } = useIcons();
  const navigateSettings = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();
  const [pendingRole, setPendingRole] = useState<RoleWithPartialMembers | null>(
    null,
  );

  const [updateWorkspaceMemberRoleMutation] =
    useUpdateWorkspaceMemberRoleMutation();

  const rolesOptions =
    allRoles
      ?.filter((role) => role.canBeAssignedToUsers)
      .map((role) => ({
        label: role.label,
        value: role.id,
        Icon: getIcon(role.icon) ?? IconUser,
      })) || [];

  const handleRoleChangeRequest = (newRoleId: string) => {
    const newRole = allRoles.find((role) => role.id === newRoleId);
    if (!newRole || newRoleId === primaryRole?.id) return;

    setPendingRole(newRole);
    openModal(CONFIRM_ROLE_CHANGE_MODAL_ID);
  };

  const handleConfirmRoleChange = async () => {
    if (!member?.id || !pendingRole) return;

    try {
      await updateWorkspaceMemberRoleMutation({
        variables: {
          workspaceMemberId: member.id,
          roleId: pendingRole.id,
        },
        refetchQueries: ['GetRoles'],
      });
      enqueueSuccessSnackBar({ message: t`Role updated successfully` });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Failed to update role`,
      });
    } finally {
      setPendingRole(null);
    }
  };

  const handleOpenRole = () => {
    if (isDefined(primaryRole)) {
      navigateSettings(SettingsPath.RoleDetail, { roleId: primaryRole.id });
    }
  };

  if (!primaryRole) {
    return (
      <StyledNoRoleContainer>{t`No role assigned to this member`}</StyledNoRoleContainer>
    );
  }

  const oldRoleLabel = primaryRole.label;
  const newRoleLabel = pendingRole?.label || '';

  return (
    <>
      <Section>
        <H2Title
          title={t`Role`}
          description={t`Customize what this user can view and perform`}
        />
        <StyledRoleContainer>
          <StyledRoleSelector>
            <Select
              dropdownId="member-role-select"
              options={rolesOptions}
              value={primaryRole.id}
              onChange={handleRoleChangeRequest}
              withSearchInput
              fullWidth
            />
          </StyledRoleSelector>
          <Button
            Icon={IconArrowUpRight}
            title={t`Open in Roles`}
            variant="secondary"
            onClick={handleOpenRole}
          />
        </StyledRoleContainer>
        <SettingsRolePermissions roleId={primaryRole.id} isEditable={false} />
      </Section>

      {pendingRole && (
        <ConfirmationModal
          modalId={CONFIRM_ROLE_CHANGE_MODAL_ID}
          title={t`Confirm role update`}
          subtitle={t`Are you sure you want to update the role of this user from "${oldRoleLabel}" to "${newRoleLabel}"?`}
          onConfirmClick={handleConfirmRoleChange}
          confirmButtonText={t`Update role`}
          confirmButtonAccent="blue"
        />
      )}
    </>
  );
};
