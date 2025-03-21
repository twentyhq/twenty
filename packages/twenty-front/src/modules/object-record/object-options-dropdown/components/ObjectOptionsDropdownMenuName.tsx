import { Key } from 'ts-key-enum';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import styled from '@emotion/styled';

const StyledDropdownMenuIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: 0;
  margin-right: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ObjectOptionsDropdownMenuName = () => {
  const [viewPickerInputName, setViewPickerInputName] =
    useRecoilComponentStateV2(viewPickerInputNameComponentState);
  const { objectMetadataItem, viewType, currentContentId, recordIndexId } =
    useOptionsDropdown();
  debugger;
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useRecoilComponentStateV2(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentStateV2(
    viewPickerIsDirtyComponentState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();

  useScopedHotkeys(
    Key.Enter,
    async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      await updateViewFromCurrentState();
    },
    ViewsHotkeyScope.ListDropdown,
  );

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
  };

  return (
    <>
      <DropdownMenuItemsContainer>
        <StyledDropdownMenuIconAndNameContainer>
          <IconPicker
            size="small"
            onChange={onIconChange}
            selectedIconKey={viewPickerSelectedIcon}
            onClose={() => setHotkeyScope(ViewsHotkeyScope.ListDropdown)}
          />
          <TextInputV2
            value={viewPickerInputName}
            onChange={(value) => {
              setViewPickerIsDirty(true);
              setViewPickerInputName(value);
            }}
            autoGrow={false}
            sizeVariant="sm"
          />
        </StyledDropdownMenuIconAndNameContainer>
      </DropdownMenuItemsContainer>
    </>
  );
};
