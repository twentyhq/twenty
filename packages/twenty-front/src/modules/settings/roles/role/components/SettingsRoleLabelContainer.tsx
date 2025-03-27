import { useRecoilState } from 'recoil';

import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { TitleInputComponentInstanceContext } from '@/ui/input/states/contexts/TitleInputComponentInstanceContext';
import { titleInputIsOpenedComponentState } from '@/ui/input/states/titleInputIsOpenedComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';

type SettingsRoleLabelContainerProps = {
  roleId: string;
  isCreateMode: boolean;
};

const ROLE_LABEL_EDIT_HOTKEY_SCOPE = 'role-label-edit';
const ROLE_LABEL_TITLE_INPUT_COMPONENT_INSTANCE_ID = 'role-label-title-input';

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

export const SettingsRoleLabelContainer = ({
  roleId,
  isCreateMode,
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

  const setIsOpened = useSetRecoilComponentStateV2(
    titleInputIsOpenedComponentState,
    ROLE_LABEL_TITLE_INPUT_COMPONENT_INSTANCE_ID,
  );

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  if (isCreateMode) {
    setIsOpened(true);
    setHotkeyScopeAndMemorizePreviousScope(ROLE_LABEL_EDIT_HOTKEY_SCOPE);
  }

  return (
    <StyledHeaderTitle>
      <TitleInputComponentInstanceContext.Provider
        value={{ instanceId: ROLE_LABEL_TITLE_INPUT_COMPONENT_INSTANCE_ID }}
      >
        <TitleInput
          disabled={!settingsDraftRole.isEditable}
          sizeVariant="md"
          value={settingsDraftRole.label}
          onChange={handleChange}
          placeholder="Role name"
          hotkeyScope={ROLE_LABEL_EDIT_HOTKEY_SCOPE}
        />
      </TitleInputComponentInstanceContext.Provider>
    </StyledHeaderTitle>
  );
};
