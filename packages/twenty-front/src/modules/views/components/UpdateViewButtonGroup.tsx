import styled from '@emotion/styled';
import {
  Button,
  ButtonGroup,
  IconChevronDown,
  IconPlus,
  MenuItem,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { UPDATE_VIEW_BUTTON_DROPDOWN_ID } from '@/views/constants/UpdateViewButtonDropdownId';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useSaveCurrentViewFiltersAndSorts } from '@/views/hooks/useSaveCurrentViewFiltersAndSorts';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { canPersistViewComponentFamilySelector } from '@/views/states/selectors/canPersistViewComponentFamilySelector';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

const StyledContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;
const StyledButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(1)};
`;
export type UpdateViewButtonGroupProps = {
  hotkeyScope: HotkeyScope;
};

export const UpdateViewButtonGroup = ({
  hotkeyScope,
}: UpdateViewButtonGroupProps) => {
  const { saveCurrentViewFilterAndSorts } = useSaveCurrentViewFiltersAndSorts();

  const { setViewPickerMode } = useViewPickerMode();

  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

  const canPersistView = useRecoilComponentFamilyValueV2(
    canPersistViewComponentFamilySelector,
    { viewId: currentViewId },
  );

  const { closeDropdown: closeUpdateViewButtonDropdown } = useDropdown(
    UPDATE_VIEW_BUTTON_DROPDOWN_ID,
  );
  const { openDropdown: openViewPickerDropdown } = useDropdown(
    VIEW_PICKER_DROPDOWN_ID,
  );
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const setViewPickerReferenceViewId = useSetRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const openViewPickerInCreateMode = () => {
    if (!currentViewId) {
      return;
    }

    openViewPickerDropdown();
    setViewPickerReferenceViewId(currentViewId);
    setViewPickerMode('create-from-current');

    closeUpdateViewButtonDropdown();
  };

  const handleCreateViewClick = () => {
    openViewPickerInCreateMode();
  };

  const handleSaveAsNewViewClick = () => {
    openViewPickerInCreateMode();
  };

  const handleUpdateViewClick = async () => {
    await saveCurrentViewFilterAndSorts();
  };

  const { hasFiltersQueryParams } = useViewFromQueryParams();

  const canShowButton = canPersistView && !hasFiltersQueryParams;

  if (!canShowButton) {
    return <></>;
  }

  return (
    <StyledContainer>
      {currentViewWithCombinedFiltersAndSorts?.key !== 'INDEX' ? (
        <ButtonGroup size="small" accent="blue">
          <Button title="Update view" onClick={handleUpdateViewClick} />
          <Dropdown
            dropdownId={UPDATE_VIEW_BUTTON_DROPDOWN_ID}
            dropdownHotkeyScope={hotkeyScope}
            clickableComponent={
              <StyledButton
                size="small"
                accent="blue"
                Icon={IconChevronDown}
                position="right"
              />
            }
            dropdownComponents={
              <DropdownMenuItemsContainer>
                <MenuItem
                  onClick={handleCreateViewClick}
                  LeftIcon={IconPlus}
                  text="Create view"
                />
              </DropdownMenuItemsContainer>
            }
          />
        </ButtonGroup>
      ) : (
        <Button
          title="Save as new view"
          onClick={handleSaveAsNewViewClick}
          accent="blue"
          size="small"
          variant="secondary"
        />
      )}
    </StyledContainer>
  );
};
