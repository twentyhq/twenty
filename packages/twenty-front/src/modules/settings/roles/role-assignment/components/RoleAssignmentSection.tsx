import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsRoleAssignmentEntityPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentEntityPickerDropdown';
import { SettingsRoleAssignmentTable } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTable';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { Section } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Agent, type ApiKeyForRole } from '~/generated-metadata/graphql';
import {
  type PartialWorkspaceMember,
  type RoleWithPartialMembers,
} from '@/settings/roles/types/RoleWithPartialMembers';
import { ROLE_TARGET_CONFIG } from '@/settings/roles/role-assignment/constants/RoleTargetConfig';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledAssignToMemberContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-block: ${themeCssVariables.spacing[2]};
`;

type RoleAssignmentSectionProps = {
  roleTargetType: keyof typeof ROLE_TARGET_CONFIG;
  roleId: string;
  settingsDraftRole: RoleWithPartialMembers;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  onSelect: (
    roleTarget: PartialWorkspaceMember | Agent | ApiKeyForRole,
    roleTargetType: keyof typeof ROLE_TARGET_CONFIG,
  ) => void;
  allWorkspaceMembersHaveThisRole?: boolean;
};

export const RoleAssignmentSection = ({
  roleTargetType,
  roleId,
  settingsDraftRole,
  currentWorkspaceMember,
  onSelect,
  allWorkspaceMembersHaveThisRole,
}: RoleAssignmentSectionProps) => {
  const config = ROLE_TARGET_CONFIG[roleTargetType];
  const { closeDropdown } = useCloseDropdown();

  if (!config.canBeAssigned(settingsDraftRole)) {
    return null;
  }

  const assignedIds = config.getAssignedIds(settingsDraftRole);
  const excludedIds = config.getExcludedIds(
    assignedIds,
    currentWorkspaceMember?.id,
  );

  return (
    <Section.Root>
      <SettingsRoleAssignmentTable
        roleId={roleId}
        roleTargetType={roleTargetType}
      />
      <StyledAssignToMemberContainer>
        <Dropdown
          dropdownId={config.dropdownId}
          dropdownOffset={{ x: 0, y: 4 }}
          clickableComponent={
            <Tooltip
              content={config.tooltip?.content()}
              delay={TooltipDelay.noDelay}
              disabled={
                !config.tooltip?.shouldShow(allWorkspaceMembersHaveThisRole)
              }
            >
              <div>
                <Button
                  startIcon={<IconPlus />}
                  size="sm"
                  disabled={allWorkspaceMembersHaveThisRole}
                  variant="outline"
                >
                  {config.buttonTitle()}
                </Button>
              </div>
            </Tooltip>
          }
          dropdownComponents={
            roleTargetType === 'member' ? (
              <SettingsRoleAssignmentWorkspaceMemberPickerDropdown
                excludedWorkspaceMemberIds={excludedIds}
                onSelect={(roleTarget: PartialWorkspaceMember) => {
                  closeDropdown(config.dropdownId);
                  onSelect(roleTarget, roleTargetType);
                }}
              />
            ) : (
              <SettingsRoleAssignmentEntityPickerDropdown
                entityType={roleTargetType}
                excludedIds={excludedIds}
                onSelect={(
                  roleTarget: PartialWorkspaceMember | Agent | ApiKeyForRole,
                ) => {
                  closeDropdown(config.dropdownId);
                  onSelect(roleTarget, roleTargetType);
                }}
              />
            )
          }
        />
      </StyledAssignToMemberContainer>
    </Section.Root>
  );
};
