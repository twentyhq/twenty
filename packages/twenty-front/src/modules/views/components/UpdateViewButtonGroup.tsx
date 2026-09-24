import { ListItem } from 'twenty-ui/primitives/navigation';
import { styled } from '@linaria/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { UPDATE_VIEW_BUTTON_DROPDOWN_ID } from '@/views/constants/UpdateViewButtonDropdownId';
import { useHasFiltersInQueryParams } from '@/views/hooks/internal/useHasFiltersInQueryParams';
import { useAreViewFilterGroupsDifferentFromRecordFilterGroups } from '@/views/hooks/useAreViewFilterGroupsDifferentFromRecordFilterGroups';
import { useAreViewFiltersDifferentFromRecordFilters } from '@/views/hooks/useAreViewFiltersDifferentFromRecordFilters';
import { useAreViewSortsDifferentFromRecordSorts } from '@/views/hooks/useAreViewSortsDifferentFromRecordSorts';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter } from '@/views/hooks/useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter';
import { useSaveCurrentViewFiltersAndSorts } from '@/views/hooks/useSaveCurrentViewFiltersAndSorts';
import { getViewPickerDropdownId } from '@/views/view-picker/utils/getViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { t } from '@lingui/core/macro';
import { IconChevronDown, IconPlus } from 'twenty-ui/icon';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { IconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  display: inline-flex;
  margin-right: ${themeCssVariables.spacing[2]};
  position: relative;
`;

export const UpdateViewButtonGroup = () => {
  const { saveCurrentViewFilterAndSorts } = useSaveCurrentViewFiltersAndSorts();
  const { canPersistChanges } = useCanPersistViewChanges();

  const { setViewPickerMode } = useViewPickerMode();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { closeDropdown: closeUpdateViewButtonDropdown } = useCloseDropdown();
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const updateViewButtonDropdownId = `${UPDATE_VIEW_BUTTON_DROPDOWN_ID}-${recordIndexId}`;
  const { openDropdown: openViewPickerDropdown } = useOpenDropdown();
  const { currentView } = useGetCurrentViewOnly();

  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  const openViewPickerInCreateMode = () => {
    if (!contextStoreCurrentViewId) {
      return;
    }

    openViewPickerDropdown({
      dropdownComponentInstanceIdFromProps:
        getViewPickerDropdownId(recordIndexId),
    });
    setViewPickerReferenceViewId(contextStoreCurrentViewId);
    setViewPickerMode('create-from-current');

    closeUpdateViewButtonDropdown(updateViewButtonDropdownId);
  };

  const handleCreateViewClick = () => {
    openViewPickerInCreateMode();
  };

  const handleSaveAsNewViewClick = () => {
    openViewPickerInCreateMode();
  };

  const handleUpdateViewClick = async () => {
    if (!canPersistChanges) return;
    await saveCurrentViewFilterAndSorts();
  };

  const { hasFiltersQueryParams } = useHasFiltersInQueryParams();

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
        <ButtonGroup size="sm" variant="solid" color="accent">
          <Button
            onClick={handleUpdateViewClick}
            disabled={!canPersistChanges}
          >{t`Update view`}</Button>
          <Dropdown
            dropdownId={updateViewButtonDropdownId}
            clickableComponent={
              <IconButton aria-label={t`View update options`}>
                <IconChevronDown />
              </IconButton>
            }
            dropdownComponents={
              <LegacyDropdownContent>
                <DropdownMenuItemsContainer>
                  <ListItem
                    onClick={handleCreateViewClick}
                    startIcon={<IconPlus />}
                  >{t`Create view`}</ListItem>
                </DropdownMenuItemsContainer>
              </LegacyDropdownContent>
            }
          />
        </ButtonGroup>
      ) : (
        <Button
          onClick={handleSaveAsNewViewClick}
          size="sm"
          variant="outline"
          color="accent"
        >{t`Save as new view`}</Button>
      )}
    </StyledContainer>
  );
};
