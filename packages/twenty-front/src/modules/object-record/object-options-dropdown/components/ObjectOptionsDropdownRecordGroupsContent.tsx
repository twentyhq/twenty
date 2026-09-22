import { ListItem } from 'twenty-ui/primitives/navigation';
import { useEffect } from 'react';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { isGroupLoadLimitSupportedForViewType } from '@/object-record/record-group/utils/isGroupLoadLimitSupportedForViewType';
import { isRecordGroupingOptionalForViewType } from '@/object-record/record-group/utils/isRecordGroupingOptionalForViewType';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { SettingsRow } from 'twenty-ui/components';
import {
  IconArrowBarToDownDashed,
  IconArrowsSort,
  IconChevronLeft,
  IconCircleOff,
  IconEyeOff,
  IconLayoutList,
  IconPlus,
} from 'twenty-ui/icon';

export const ObjectOptionsDropdownRecordGroupsContent = () => {
  const { t } = useLingui();
  const {
    viewType,
    currentContentId,
    onContentChange,
    resetContent,
    handleRecordGroupOrderChangeWithModal,
    dropdownId,
  } = useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const hiddenRecordGroupIds = useAtomComponentSelectorValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const recordIndexShouldHideEmptyRecordGroups = useAtomComponentStateValue(
    recordIndexShouldHideEmptyRecordGroupsComponentState,
  );

  const shouldHideEmptyGroups =
    recordIndexShouldHideEmptyRecordGroups ??
    currentView?.shouldHideEmptyGroups ??
    false;

  const recordIndexGroupLoadLimit = useAtomComponentStateValue(
    recordIndexGroupLoadLimitComponentState,
  );

  const recordIndexRecordGroupSort = useAtomComponentStateValue(
    recordIndexRecordGroupSortComponentState,
  );

  const {
    handleVisibilityChange: handleRecordGroupVisibilityChange,
    handleHideEmptyRecordGroupChange,
  } = useRecordGroupVisibility();

  const { availableFieldsForGrouping } =
    useGetAvailableFieldsToGroupRecordsBy();

  const isGroupByFieldPickerDisabled =
    availableFieldsForGrouping.length <= 1 &&
    !isRecordGroupingOptionalForViewType(viewType);

  const isRelationGroupBy =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isManyToOneRelationField(recordIndexGroupFieldMetadataItem);

  const shouldShowGroupLoadLimit =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isGroupLoadLimitSupportedForViewType(viewType);

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroupIds.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroupIds, currentContentId, onContentChange]);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const selectableItemIdArray = [
    ...(currentView?.key !== 'INDEX' ? ['GroupBy', 'Sort'] : []),
    'HideEmptyGroups',
    ...(shouldShowGroupLoadLimit ? ['LoadLimit'] : []),
  ];

  const hiddenGroupsSelectableListId = `${dropdownId}-hidden-groups`;

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Group`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          {currentView?.key !== 'INDEX' && (
            <>
              <SelectableListItem
                itemId="GroupBy"
                onEnter={() =>
                  !isGroupByFieldPickerDisabled &&
                  onContentChange('recordGroupFields')
                }
              >
                <ListItem
                  focused={selectedItemId === 'GroupBy'}
                  disabled={isGroupByFieldPickerDisabled}
                  onClick={() => onContentChange('recordGroupFields')}
                  startIcon={<IconLayoutList />}
                  description={recordIndexGroupFieldMetadataItem?.label}
                  descriptionPlacement="end"
                  hasSubmenu
                >{t`Group by`}</ListItem>
              </SelectableListItem>
              <SelectableListItem
                itemId="Sort"
                onEnter={() => onContentChange('recordGroupSort')}
              >
                <ListItem
                  focused={selectedItemId === 'Sort'}
                  onClick={() => onContentChange('recordGroupSort')}
                  startIcon={<IconArrowsSort />}
                  description={recordIndexRecordGroupSort}
                  descriptionPlacement="end"
                  hasSubmenu
                >{t`Sort`}</ListItem>
              </SelectableListItem>
            </>
          )}
          <SelectableListItem
            itemId="HideEmptyGroups"
            onEnter={() => handleHideEmptyRecordGroupChange()}
          >
            <SettingsRow
              focused={selectedItemId === 'HideEmptyGroups'}
              startIcon={<IconCircleOff />}
              onCheckedChange={handleHideEmptyRecordGroupChange}
              checked={shouldHideEmptyGroups}
            >{t`Hide empty groups`}</SettingsRow>
          </SelectableListItem>
          {shouldShowGroupLoadLimit && (
            <SelectableListItem
              itemId="LoadLimit"
              onEnter={() => onContentChange('recordGroupLoadLimit')}
            >
              <ListItem
                focused={selectedItemId === 'LoadLimit'}
                onClick={() => onContentChange('recordGroupLoadLimit')}
                startIcon={<IconArrowBarToDownDashed />}
                description={String(recordIndexGroupLoadLimit)}
                descriptionPlacement="end"
                hasSubmenu
              >{t`Load limit`}</ListItem>
            </SelectableListItem>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
      {visibleRecordGroupIds.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <RecordGroupsVisibilityDropdownSection
            title={t`Visible groups`}
            recordGroupIds={visibleRecordGroupIds}
            onDragEnd={handleRecordGroupOrderChangeWithModal}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable={true}
            showDragGrip={true}
          />
        </>
      )}
      {isRelationGroupBy && currentView?.key !== 'INDEX' && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <ListItem
              onClick={() => onContentChange('addRecordGroup')}
              startIcon={<IconPlus />}
            >{t`New group`}</ListItem>
          </DropdownMenuItemsContainer>
        </>
      )}
      {hiddenRecordGroupIds.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <SelectableList
              selectableListInstanceId={hiddenGroupsSelectableListId}
              focusId={hiddenGroupsSelectableListId}
              selectableItemIdArray={['HiddenGroups']}
            >
              <SelectableListItem
                itemId="HiddenGroups"
                onEnter={() => onContentChange('hiddenRecordGroups')}
              >
                <ListItem
                  onClick={() => onContentChange('hiddenRecordGroups')}
                  startIcon={<IconEyeOff />}
                  render={<button type="button" />}
                  hasSubmenu
                >{`${t`Hidden`} ${recordIndexGroupFieldMetadataItem?.label ?? ''}`}</ListItem>
              </SelectableListItem>
            </SelectableList>
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
