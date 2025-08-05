import styled from '@emotion/styled';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { UPDATE_VIEW_BUTTON_DROPDOWN_ID } from '@/views/constants/UpdateViewButtonDropdownId';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useAreViewFilterGroupsDifferentFromRecordFilterGroups } from '@/views/hooks/useAreViewFilterGroupsDifferentFromRecordFilterGroups';
import { useAreViewFiltersDifferentFromRecordFilters } from '@/views/hooks/useAreViewFiltersDifferentFromRecordFilters';
import { useAreViewSortsDifferentFromRecordSorts } from '@/views/hooks/useAreViewSortsDifferentFromRecordSorts';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter } from '@/views/hooks/useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter';
import { useSaveCurrentViewFiltersAndSorts } from '@/views/hooks/useSaveCurrentViewFiltersAndSorts';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { t } from '@lingui/core/macro';
import { IconChevronDown, IconPlus } from 'twenty-ui/display';
import { Button, ButtonGroup, IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

const StyledContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export const UpdateViewButtonGroup = () => {
  const { saveCurrentViewFilterAndSorts } = useSaveCurrentViewFiltersAndSorts();

  const { setViewPickerMode } = useViewPickerMode();

  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { closeDropdown: closeUpdateViewButtonDropdown } = useCloseDropdown();
  const { openDropdown: openViewPickerDropdown } = useOpenDropdown();
  const { currentView } = useGetCurrentViewOnly();

  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  const openViewPickerInCreateMode = () => {
    if (!currentViewId) {
      return;
    }

    openViewPickerDropdown({
      dropdownComponentInstanceIdFromProps: VIEW_PICKER_DROPDOWN_ID,
    });
    setViewPickerReferenceViewId(currentViewId);
    setViewPickerMode('create-from-current');

    closeUpdateViewButtonDropdown(UPDATE_VIEW_BUTTON_DROPDOWN_ID);
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

  const { viewFilterGroupsAreDifferentFromRecordFilterGroups } =
    useAreViewFilterGroupsDifferentFromRecordFilterGroups();

  const { viewFiltersAreDifferentFromRecordFilters } =
    useAreViewFiltersDifferentFromRecordFilters();

  const { viewSortsAreDifferentFromRecordSorts } =
    useAreViewSortsDifferentFromRecordSorts();

  const { viewAnyFieldFilterDifferentFromCurrentAnyFieldFilter } =
    useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter();

  const canShowButton =
    (viewFiltersAreDifferentFromRecordFilters ||
      viewSortsAreDifferentFromRecordSorts ||
      viewFilterGroupsAreDifferentFromRecordFilterGroups ||
      viewAnyFieldFilterDifferentFromCurrentAnyFieldFilter) &&
    !hasFiltersQueryParams;

  if (!canShowButton) {
    return <></>;
  }

  return (
    <StyledContainer>
      {currentView?.key !== 'INDEX' ? (
        <ButtonGroup size="small" accent="blue">
          <Button title="Update view" onClick={handleUpdateViewClick} />
          <Dropdown
            dropdownId={UPDATE_VIEW_BUTTON_DROPDOWN_ID}
            clickableComponent={
              <IconButton
                size="small"
                accent="blue"
                Icon={IconChevronDown}
                position="right"
              />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItem
                    onClick={handleCreateViewClick}
                    LeftIcon={IconPlus}
                    text={t`Create view`}
                  />
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        </ButtonGroup>
      ) : (
        <Button
          title={t`Save as new view`}
          onClick={handleSaveAsNewViewClick}
          accent="blue"
          size="small"
          variant="secondary"
        />
      )}
    </StyledContainer>
  );
};
