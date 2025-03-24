import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsValidateRoleFamilyState } from '@/settings/roles/states/settingsValidateRoleFamilyState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';

type RoleLabelContainerProps = {
  roleId: string;
};

const ROLE_LABEL_EDIT_HOTKEY_SCOPE = 'role-label-edit';

const StyledEditableTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  width: 100%;
`;

const StyledTitle = styled.div`
  max-width: 100%;
  overflow: hidden;
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: fit-content;
`;

export const RoleLabelContainer = ({ roleId }: RoleLabelContainerProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const [settingsValidateRole, setSettingsValidateRole] = useRecoilState(
    settingsValidateRoleFamilyState(roleId),
  );

  const [label, setLabel] = useState(settingsDraftRole.label);

  const [isEditMode, setIsEditMode] = useState(label === '');

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  if (isEditMode && label === '') {
    setHotkeyScopeAndMemorizePreviousScope(ROLE_LABEL_EDIT_HOTKEY_SCOPE);
  }

  const handleClick = () => {
    setIsEditMode(true);
    setHotkeyScopeAndMemorizePreviousScope(ROLE_LABEL_EDIT_HOTKEY_SCOPE);
  };

  const handleBlur = () => {
    if (label !== '') {
      setSettingsDraftRole({
        ...settingsDraftRole,
        label: label,
      });
      setIsEditMode(false);
      goBackToPreviousHotkeyScope();
    }
  };

  const handleChange = (newValue: string) => {
    setLabel(newValue);
  };

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (label === '') {
        setSettingsValidateRole({
          ...settingsValidateRole,
          label: false,
        });
      }
      if (label !== '') {
        setSettingsDraftRole({
          ...settingsDraftRole,
          label: label,
        });
        setIsEditMode(false);
        goBackToPreviousHotkeyScope();
      }
    },
    ROLE_LABEL_EDIT_HOTKEY_SCOPE,
    [setIsEditMode, goBackToPreviousHotkeyScope, label],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      if (label !== '') {
        setIsEditMode(false);
        goBackToPreviousHotkeyScope();
      }
    },
    ROLE_LABEL_EDIT_HOTKEY_SCOPE,
    [setIsEditMode, goBackToPreviousHotkeyScope, label],
  );

  if (isEditMode) {
    return (
      <TextInputV2
        value={label}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
        placeholder="Enter role name"
      />
    );
  }

  return (
    <StyledEditableTitleContainer onClick={handleClick}>
      <StyledTitle>{label}</StyledTitle>
    </StyledEditableTitleContainer>
  );
};
