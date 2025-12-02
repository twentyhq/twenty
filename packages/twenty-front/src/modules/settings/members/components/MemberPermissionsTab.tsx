import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
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

  const handleRoleChange = async (newRoleId: string) => {
    if (!member?.id) return;

    try {
      await updateWorkspaceMemberRoleMutation({
        variables: {
          workspaceMemberId: member.id,
          roleId: newRoleId,
        },
        refetchQueries: ['GetRoles'],
      });
      enqueueSuccessSnackBar({ message: t`Role updated successfully` });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Failed to update role`,
      });
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

  return (
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
            onChange={handleRoleChange}
            withSearchInput
            fullWidth
          />
        </StyledRoleSelector>
        <Button
          Icon={IconArrowUpRight}
          title={t`Open`}
          variant="secondary"
          onClick={handleOpenRole}
        />
      </StyledRoleContainer>
      <SettingsRolePermissions roleId={primaryRole.id} isEditable={false} />
    </Section>
  );
};
