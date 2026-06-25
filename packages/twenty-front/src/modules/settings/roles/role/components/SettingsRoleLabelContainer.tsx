import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderTitle = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  max-width: 420px;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  width: fit-content;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  & > div:hover {
    background: transparent;
  }

  & > div :hover {
    background: transparent;
  }

  & > input:disabled {
    color: ${themeCssVariables.font.color.primary};
  }
`;

type SettingsRoleLabelContainerProps = {
  roleId: string;
};

export const SettingsRoleLabelContainer = ({
  roleId,
}: SettingsRoleLabelContainerProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
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
        sizeVariant="sm"
        value={settingsDraftRole.label}
        onChange={handleChange}
        placeholder={t`Role name`}
      />
    </StyledHeaderTitle>
  );
};
