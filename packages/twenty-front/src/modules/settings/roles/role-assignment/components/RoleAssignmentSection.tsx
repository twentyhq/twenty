import { SettingsRoleAssignmentEntityPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentEntityPickerDropdown';
import { SettingsRoleAssignmentTable } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTable';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { Dropdown, Section } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
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
  currentWorkspaceMember?: PartialWorkspaceMember;
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
        <DropdownRoot dropdownId={config.dropdownId} type="picker">
          <Tooltip
            content={config.tooltip?.content()}
            delay={TooltipDelay.noDelay}
            disabled={
              !config.tooltip?.shouldShow(allWorkspaceMembersHaveThisRole)
            }
          >
            <div>
              <Dropdown.Trigger
                disabled={allWorkspaceMembersHaveThisRole}
                render={
                  <Button
                    startIcon={<IconPlus />}
                    size="sm"
                    disabled={allWorkspaceMembersHaveThisRole}
                    variant="outline"
                  >
                    {config.buttonTitle()}
                  </Button>
                }
              />
            </div>
          </Tooltip>
          <DropdownContent
            width={
              roleTargetType === 'member'
                ? GenericDropdownContentWidth.ExtraLarge
                : GenericDropdownContentWidth.Medium
            }
            align="end"
            sideOffset={4}
          >
            {roleTargetType === 'member' ? (
              <SettingsRoleAssignmentWorkspaceMemberPickerDropdown
                excludedWorkspaceMemberIds={excludedIds}
                onSelect={(roleTarget: PartialWorkspaceMember) =>
                  onSelect(roleTarget, roleTargetType)
                }
              />
            ) : (
              <SettingsRoleAssignmentEntityPickerDropdown
                entityType={roleTargetType}
                excludedIds={excludedIds}
                onSelect={(roleTarget: Agent | ApiKeyForRole) =>
                  onSelect(roleTarget, roleTargetType)
                }
              />
            )}
          </DropdownContent>
        </DropdownRoot>
      </StyledAssignToMemberContainer>
    </Section.Root>
  );
};
