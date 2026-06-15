import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { InputHint } from '@/ui/input/components/InputHint';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

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

const StyledContainer = styled.div`
  position: relative;
`;

const StyledHint = styled.div`
  left: 100%;
  margin-left: ${themeCssVariables.spacing[2]};
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
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

  const allRoles = useSettingsAllRoles();

  const normalizedLabel = settingsDraftRole.label;

  const hasDuplicateLabel =
    isNonEmptyString(normalizedLabel) &&
    allRoles.some(
      (role) => role.id !== roleId && role.label === normalizedLabel,
    );

  const handleChange = (newValue: string) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      label: newValue,
    });
  };

  return (
    <StyledContainer>
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
      {hasDuplicateLabel && (
        <StyledHint>
          <InputHint
            danger
          >{t`Another role already uses this name.`}</InputHint>
        </StyledHint>
      )}
    </StyledContainer>
  );
};
