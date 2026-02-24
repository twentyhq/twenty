import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useSetFamilyAtomState } from '@/ui/utilities/state/jotai/hooks/useSetFamilyAtomState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

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
  const settingsDraftRole = useFamilyAtomValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetFamilyAtomState(
    settingsDraftRoleFamilyState,
    roleId,
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
        instanceId="role-label-input"
        disabled={!settingsDraftRole.isEditable}
        sizeVariant="md"
        value={settingsDraftRole.label}
        onChange={handleChange}
        placeholder={t`Role name`}
      />
    </StyledHeaderTitle>
  );
};
