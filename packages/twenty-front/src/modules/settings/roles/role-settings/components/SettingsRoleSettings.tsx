import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';

import { ROLE_SETTINGS_DELETE_ROLE_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-settings/components/constants/RoleSettingsDeleteRoleConfirmationModalId';
import { SettingsRoleSettingsDeleteRoleConfirmationModal } from '@/settings/roles/role-settings/components/SettingsRoleSettingsDeleteRoleConfirmationModal';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const { openModal } = useModal();

  return (
    <>
      <Section>
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
          <TextInput
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
          minRows={4}
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
      </Section>

      {!isCreateMode && (
        <>
          <Section>
            <H2Title
              title={t`Danger zone`}
              description={t`Delete this role and assign a new role to its members`}
            />
            <Button
              title={t`Delete role`}
              size="small"
              variant="secondary"
              accent="danger"
              onClick={() => {
                openModal(ROLE_SETTINGS_DELETE_ROLE_CONFIRMATION_MODAL_ID);
              }}
              disabled={!isEditable}
            />
          </Section>
          <SettingsRoleSettingsDeleteRoleConfirmationModal roleId={roleId} />
        </>
      )}
    </>
  );
};
