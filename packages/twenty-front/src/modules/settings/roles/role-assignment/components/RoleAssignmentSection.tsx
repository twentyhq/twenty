import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsRoleAssignmentEntityPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentEntityPickerDropdown';
import { SettingsRoleAssignmentTable } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTable';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { AppTooltip, IconPlus, TooltipDelay } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { type Agent, type Role } from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';
import { ROLE_TARGET_CONFIG } from '../constants/RoleTargetConfig';

const StyledAssignToMemberContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-block: ${({ theme }) => theme.spacing(2)};
`;

type RoleAssignmentSectionProps = {
  roleTargetType: keyof typeof ROLE_TARGET_CONFIG;
  roleId: string;
  settingsDraftRole: Role;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  onSelect: (
    roleTarget: CurrentWorkspaceMember | Agent | ApiKeyForRole,
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
    <Section>
      <SettingsRoleAssignmentTable
        roleId={roleId}
        roleTargetType={roleTargetType}
      />
      <StyledAssignToMemberContainer>
        <Dropdown
          dropdownId={config.dropdownId}
          dropdownOffset={{ x: 0, y: 4 }}
          clickableComponent={
            roleTargetType === 'member' ? (
              <>
                <div id="assign-member">
                  <Button
                    Icon={IconPlus}
                    title={config.buttonTitle()}
                    variant="secondary"
                    size="small"
                    disabled={allWorkspaceMembersHaveThisRole}
                  />
                </div>
                <AppTooltip
                  anchorSelect="#assign-member"
                  content={t`The workspace needs at least one Admin`}
                  delay={TooltipDelay.noDelay}
                  hidden={!allWorkspaceMembersHaveThisRole}
                />
              </>
            ) : (
              <Button
                Icon={IconPlus}
                title={config.buttonTitle()}
                variant="secondary"
                size="small"
              />
            )
          }
          dropdownComponents={
            roleTargetType === 'member' ? (
              <SettingsRoleAssignmentWorkspaceMemberPickerDropdown
                excludedWorkspaceMemberIds={excludedIds}
                onSelect={(roleTarget: CurrentWorkspaceMember) => {
                  closeDropdown(config.dropdownId);
                  onSelect(roleTarget, roleTargetType);
                }}
              />
            ) : (
              <SettingsRoleAssignmentEntityPickerDropdown
                entityType={roleTargetType}
                excludedIds={excludedIds}
                onSelect={(
                  roleTarget: CurrentWorkspaceMember | Agent | ApiKeyForRole,
                ) => {
                  closeDropdown(config.dropdownId);
                  onSelect(roleTarget, roleTargetType);
                }}
              />
            )
          }
        />
      </StyledAssignToMemberContainer>
    </Section>
  );
};
