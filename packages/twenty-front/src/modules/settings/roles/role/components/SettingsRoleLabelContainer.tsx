import { useRecoilState } from 'recoil';

import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';

const ROLE_LABEL_EDIT_HOTKEY_SCOPE = 'role-label-edit';

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.lg};
  width: fit-content;
  max-width: 420px;
  & > input:disabled {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type SettingsRoleLabelContainerProps = {
  roleId: string;
};

export const SettingsRoleLabelContainer = ({
  roleId,
}: SettingsRoleLabelContainerProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const handleChange = (newValue: string) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      label: newValue,
    });
  };

  return (
    <StyledHeaderTitle>
      <TitleInput
        disabled={!settingsDraftRole.isEditable}
        sizeVariant="md"
        value={settingsDraftRole.label}
        onChange={handleChange}
        placeholder="Role name"
        hotkeyScope={ROLE_LABEL_EDIT_HOTKEY_SCOPE}
      />
    </StyledHeaderTitle>
  );
};
