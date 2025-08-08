import { Key } from 'ts-key-enum';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewPickerEditButton } from '@/views/view-picker/components/ViewPickerEditButton';
import { ViewPickerIconAndNameContainer } from '@/views/view-picker/components/ViewPickerIconAndNameContainer';
import { ViewPickerSaveButtonContainer } from '@/views/view-picker/components/ViewPickerSaveButtonContainer';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { IconChevronLeft } from 'twenty-ui/display';

export const ViewPickerContentEditMode = () => {
  const { setViewPickerMode } = useViewPickerMode();

  const [viewPickerInputName, setViewPickerInputName] = useRecoilComponentState(
    viewPickerInputNameComponentState,
  );
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useRecoilComponentState(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValue(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentState(
    viewPickerIsDirtyComponentState,
  );

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      await updateViewFromCurrentState();
    },
    focusId: VIEW_PICKER_DROPDOWN_ID,
    dependencies: [viewPickerIsPersisting, updateViewFromCurrentState],
  });

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
  };

  const handleClose = async () => {
    await updateViewFromCurrentState();

    setViewPickerMode('list');
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleClose}
            Icon={IconChevronLeft}
          />
        }
      >
        Edit view
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <ViewPickerIconAndNameContainer>
          <IconPicker
            onChange={onIconChange}
            selectedIconKey={viewPickerSelectedIcon}
          />
          <TextInput
            value={viewPickerInputName}
            onChange={(value) => {
              setViewPickerIsDirty(true);
              setViewPickerInputName(value);
            }}
            autoFocus
          />
        </ViewPickerIconAndNameContainer>
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <ViewPickerSaveButtonContainer>
          <ViewPickerEditButton />
        </ViewPickerSaveButtonContainer>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
