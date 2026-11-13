import { styled } from '@linaria/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
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
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconLayoutNavbar,
  IconPlus,
  IconRefresh,
} from 'twenty-ui/icon';
import { isNonEmptyString } from '@sniptt/guards';
import { TextInputDropdownForm } from '@/advanced-text-editor/components/TextInputDropdownForm';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecordIndexCustomTabsState } from '@/object-record/record-index-tab/hooks/useRecordIndexCustomTabsState';
import { useSaveCurrentRecordFiltersAsRecordIndexTab } from '@/object-record/record-index-tab/hooks/useSaveCurrentRecordFiltersAsRecordIndexTab';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const SAVE_AS_TAB_DROPDOWN_PAGE_ID = 'save-as-tab';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${themeCssVariables.spacing[2]};
  position: relative;
`;

export const UpdateViewButtonGroup = () => {
  const { t } = useLingui();
  const { saveCurrentViewFilterAndSorts } = useSaveCurrentViewFiltersAndSorts();
  const { canPersistChanges } = useCanPersistViewChanges();

  const { setViewPickerMode } = useViewPickerMode();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { recordIndexId } = useRecordIndexContextOrThrow();
  const updateViewButtonDropdownId = `${UPDATE_VIEW_BUTTON_DROPDOWN_ID}-${recordIndexId}`;
  const { openDropdown: openViewPickerDropdown } = useOpenDropdown();
  const { currentView } = useGetCurrentViewOnly();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getViewPickerDropdownId(recordIndexId),
  );

  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  const openViewPickerInCreateMode = () => {
    if (!isDefined(contextStoreCurrentViewId)) {
      return;
    }

    openViewPickerDropdown({
      dropdownComponentInstanceIdFromProps:
        getViewPickerDropdownId(recordIndexId),
    });
    setViewPickerReferenceViewId(contextStoreCurrentViewId);
    setViewPickerMode('create-from-current');
  };

  const handleCreateViewClick = () => {
    openViewPickerInCreateMode();
  };

  const handleSaveAsNewViewClick = () => {
    openViewPickerInCreateMode();
  };

  const handleUpdateViewClick = async () => {
    if (!canPersistChanges) {
      return;
    }
    await saveCurrentViewFilterAndSorts();
  };

  const { canEditCustomTabs, activeCustomViewTab } =
    useRecordIndexCustomTabsState();

  const activeCustomViewTabName = activeCustomViewTab?.name ?? '';

  const {
    saveCurrentRecordFiltersAsNewRecordIndexTab,
    saveCurrentRecordFiltersToRecordIndexTab,
  } = useSaveCurrentRecordFiltersAsRecordIndexTab();

  const { closeDropdown } = useCloseDropdown();

  const handleSaveAsTabSubmit = async (name: string) => {
    const trimmedName = name.trim();

    if (!isNonEmptyString(trimmedName)) {
      return;
    }

    closeDropdown(updateViewButtonDropdownId);
    await saveCurrentRecordFiltersAsNewRecordIndexTab(trimmedName);
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
          <DropdownRoot dropdownId={updateViewButtonDropdownId} type="menu">
            <Dropdown.Trigger
              render={
                <IconButton aria-label={t`View update options`}>
                  <IconChevronDown />
                </IconButton>
              }
            />
            <DropdownContent align="end" finalFocus={() => !isDropdownOpen}>
              <Dropdown.Page id="root">
                <Dropdown.Section>
                  <Dropdown.ActionItem
                    onClick={handleCreateViewClick}
                    startIcon={<IconPlus />}
                  >{t`Create view`}</Dropdown.ActionItem>
                  {canEditCustomTabs && (
                    <Dropdown.ActionItem
                      page={SAVE_AS_TAB_DROPDOWN_PAGE_ID}
                      startIcon={<IconLayoutNavbar />}
                    >{t`Save as tab`}</Dropdown.ActionItem>
                  )}
                  {canEditCustomTabs && isDefined(activeCustomViewTab) && (
                    <Dropdown.ActionItem
                      onClick={() =>
                        saveCurrentRecordFiltersToRecordIndexTab(
                          activeCustomViewTab,
                        )
                      }
                      startIcon={<IconRefresh />}
                    >{t`Update “${activeCustomViewTabName}”`}</Dropdown.ActionItem>
                  )}
                </Dropdown.Section>
              </Dropdown.Page>
              <Dropdown.Page id={SAVE_AS_TAB_DROPDOWN_PAGE_ID} type="panel">
                {/* A back button would take the focus that the name input needs */}
                <Dropdown.Header>
                  <Dropdown.Title>{t`Save as tab`}</Dropdown.Title>
                </Dropdown.Header>
                <Dropdown.Section>
                  <TextInputDropdownForm
                    defaultValue=""
                    label={t`Tab name`}
                    onSubmit={handleSaveAsTabSubmit}
                  />
                </Dropdown.Section>
              </Dropdown.Page>
            </DropdownContent>
          </DropdownRoot>
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
