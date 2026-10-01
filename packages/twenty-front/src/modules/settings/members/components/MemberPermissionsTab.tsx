import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { Select } from '@/ui/input/components/Select';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconArrowUpRight, IconUser, useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { UpdateWorkspaceMemberRoleDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const CONFIRM_ROLE_CHANGE_MODAL_ID = 'confirm-role-change-modal';

const StyledNoRoleContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]};
`;

const StyledRoleContainer = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[8]};
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
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const [pendingRole, setPendingRole] = useState<RoleWithPartialMembers | null>(
    null,
  );

  const [updateWorkspaceMemberRoleMutation] = useMutation(
    UpdateWorkspaceMemberRoleDocument,
  );

  const rolesOptions =
    allRoles
      ?.filter((role) => role.canBeAssignedToUsers)
      .map((role) => ({
        label: role.label,
        value: role.id,
        Icon: getIcon(role.icon) ?? IconUser,
      })) ?? [];

  const handleRoleChangeRequest = (newRoleId: string) => {
    const newRole = allRoles.find((role) => role.id === newRoleId);
    if (!newRole || newRoleId === primaryRole?.id) return;

    setPendingRole(newRole);
    openDialog(CONFIRM_ROLE_CHANGE_MODAL_ID);
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
      enqueueToast({
        variant: 'success',
        children: t`Role updated successfully`,
      });
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
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

  if (!isDefined(primaryRole)) {
    return (
      <StyledNoRoleContainer>{t`No role assigned to this member`}</StyledNoRoleContainer>
    );
  }

  const oldRoleLabel = primaryRole.label;
  const newRoleLabel = pendingRole?.label || '';

  return (
    <>
      <Section.Root>
        <Section.Header
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
            startIcon={<IconArrowUpRight />}
            onClick={handleOpenRole}
            variant="outline"
          >{t`Open in Roles`}</Button>
        </StyledRoleContainer>
        <SettingsRolePermissions roleId={primaryRole.id} isEditable={false} />
      </Section.Root>

      {pendingRole && (
        <ConfirmationDialog
          dialogId={CONFIRM_ROLE_CHANGE_MODAL_ID}
          title={t`Confirm role update`}
          subtitle={t`Are you sure you want to update the role of this user from "${oldRoleLabel}" to "${newRoleLabel}"?`}
          onConfirmClick={handleConfirmRoleChange}
          confirmButtonText={t`Update role`}
          confirmButtonColor="accent"
        />
      )}
    </>
  );
};
