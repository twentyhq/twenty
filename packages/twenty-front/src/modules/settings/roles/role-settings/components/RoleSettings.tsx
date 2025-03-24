import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useRecoilState } from 'recoil';
import { Section } from 'twenty-ui';

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

type RoleSettingsProps = {
  roleId: string;
  isEditable: boolean;
};

export const RoleSettings = ({ roleId, isEditable }: RoleSettingsProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  return (
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
  );
};
