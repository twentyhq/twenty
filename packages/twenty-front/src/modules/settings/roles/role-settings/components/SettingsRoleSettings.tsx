import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsRoleApplicability } from '@/settings/roles/role-settings/components/SettingsRoleApplicability';
import { SettingsRoleSettingsDeleteRoleConfirmationModal } from '@/settings/roles/role-settings/components/SettingsRoleSettingsDeleteRoleConfirmationModal';
import { ROLE_SETTINGS_DELETE_ROLE_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-settings/components/constants/RoleSettingsDeleteRoleConfirmationModalId';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type SettingsRoleSettingsProps = {
  roleId: string;
  isEditable: boolean;
  isCreateMode: boolean;
};

export const SettingsRoleSettings = ({
  roleId,
  isEditable,
  isCreateMode,
}: SettingsRoleSettingsProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { openDialog } = useDialog();

  const isMemberRole =
    settingsDraftRole.universalIdentifier === MEMBER_ROLE_UNIVERSAL_IDENTIFIER;
  const isDefaultRole = currentWorkspace?.defaultRole?.id === roleId;

  const deleteRoleDescription = isMemberRole
    ? t`The Member role cannot be deleted`
    : isDefaultRole
      ? t`The default role cannot be deleted. Choose another default role first`
      : t`Delete this role and assign a new role to its members`;

  const descriptionTextAreaId = `${roleId}-description`;
  const nameTextInputId = `${roleId}-name`;

  return (
    <>
      <Section.Root>
        <StyledInputsContainer>
          <StyledInputContainer>
            <IconPicker
              selectedIconKey={settingsDraftRole.icon ?? 'IconUser'}
              dropdownId="role-settings-icon-picker"
              onChange={({ iconKey }: { iconKey: string }) => {
                setSettingsDraftRole({
                  ...settingsDraftRole,
                  icon: iconKey,
                });
              }}
              disabled={!isEditable}
            />
          </StyledInputContainer>
          <SettingsTextInput
            instanceId={nameTextInputId}
            value={settingsDraftRole.label}
            fullWidth
            onChange={(value: string) => {
              setSettingsDraftRole({
                ...settingsDraftRole,
                label: value,
              });
            }}
            placeholder={t`Role name`}
            disabled={!isEditable}
          />
        </StyledInputsContainer>
        <TextArea
          textAreaId={descriptionTextAreaId}
          minRows={4}
          maxRows={5}
          placeholder={t`Write a description`}
          value={settingsDraftRole.description || ''}
          onChange={(value: string) => {
            setSettingsDraftRole({
              ...settingsDraftRole,
              description: value,
            });
          }}
          disabled={!isEditable}
        />
      </Section.Root>

      <SettingsRoleApplicability
        values={{
          canBeAssignedToUsers: settingsDraftRole.canBeAssignedToUsers,
          canBeAssignedToAgents: settingsDraftRole.canBeAssignedToAgents,
          canBeAssignedToApiKeys: settingsDraftRole.canBeAssignedToApiKeys,
        }}
        onApplicabilityChange={(key, value) => {
          setSettingsDraftRole({
            ...settingsDraftRole,
            [key]: value,
          });
        }}
        isEditable={isEditable}
      />

      {!isCreateMode && (
        <>
          <Section.Root>
            <Section.Header
              title={t`Danger zone`}
              description={deleteRoleDescription}
            />
            <Button
              size="sm"
              onClick={() => {
                openDialog(ROLE_SETTINGS_DELETE_ROLE_CONFIRMATION_MODAL_ID);
              }}
              disabled={!isEditable || isMemberRole || isDefaultRole}
              variant="outline"
              color="danger"
            >{t`Delete role`}</Button>
          </Section.Root>
          <SettingsRoleSettingsDeleteRoleConfirmationModal roleId={roleId} />
        </>
      )}
    </>
  );
};
