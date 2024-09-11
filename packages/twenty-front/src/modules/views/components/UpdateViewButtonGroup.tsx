import styled from '@emotion/styled';
import { useCallback } from 'react';
import { IconChevronDown, IconPlus } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { UPDATE_VIEW_BUTTON_DROPDOWN_ID } from '@/views/constants/UpdateViewButtonDropdownId';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useSaveCurrentViewFiltersAndSorts } from '@/views/hooks/useSaveCurrentViewFiltersAndSorts';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { canPersistViewComponentSelector } from '@/views/states/selectors/canPersistViewComponentSelector';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

const StyledContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export type UpdateViewButtonGroupProps = {
  hotkeyScope: HotkeyScope;
};

export const UpdateViewButtonGroup = ({
  hotkeyScope,
}: UpdateViewButtonGroupProps) => {
  const { saveCurrentViewFilterAndSorts } = useSaveCurrentViewFiltersAndSorts();

  const { setViewPickerMode } = useViewPickerMode();

  const canPersistView = useRecoilComponentSelectorValueV2(
    canPersistViewComponentSelector,
  );
  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

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

  const handleViewCreate = useCallback(() => {
    if (!currentViewId) {
      return;
    }
    openViewPickerDropdown();
    setViewPickerReferenceViewId(currentViewId);
    setViewPickerMode('create');

    closeUpdateViewButtonDropdown();
  }, [
    closeUpdateViewButtonDropdown,
    currentViewId,
    openViewPickerDropdown,
    setViewPickerMode,
    setViewPickerReferenceViewId,
  ]);

  const handleViewUpdate = async () => {
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
          <Button title="Update view" onClick={handleViewUpdate} />
          <Dropdown
            dropdownId={UPDATE_VIEW_BUTTON_DROPDOWN_ID}
            dropdownHotkeyScope={hotkeyScope}
            clickableComponent={
              <Button
                size="small"
                accent="blue"
                Icon={IconChevronDown}
                position="right"
              />
            }
            dropdownComponents={
              <>
                <DropdownMenuItemsContainer>
                  <MenuItem
                    onClick={handleViewCreate}
                    LeftIcon={IconPlus}
                    text="Create view"
                  />
                </DropdownMenuItemsContainer>
              </>
            }
          />
        </ButtonGroup>
      ) : (
        <Button
          title="Save as new view"
          onClick={handleViewCreate}
          accent="blue"
          size="small"
          variant="secondary"
        />
      )}
    </StyledContainer>
  );
};
