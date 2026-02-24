import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
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
  const settingsDraftRole = useFamilyRecoilValueV2(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetFamilyRecoilStateV2(
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
