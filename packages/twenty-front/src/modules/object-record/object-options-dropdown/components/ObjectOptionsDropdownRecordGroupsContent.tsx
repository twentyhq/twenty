import { useEffect } from 'react';

import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useLingui } from '@lingui/react/macro';
import {
  IconChevronLeft,
  IconCircleOff,
  IconEyeOff,
  IconLayoutList,
  IconSortDescending,
} from 'twenty-ui/display';
import {
  MenuItem,
  MenuItemNavigate,
  MenuItemToggle,
} from 'twenty-ui/navigation';

export const ObjectOptionsDropdownRecordGroupsContent = () => {
  const { t } = useLingui();
  const {
    viewType,
    currentContentId,
    onContentChange,
    resetContent,
    handleRecordGroupOrderChangeWithModal,
  } = useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilyValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const hiddenRecordGroupIds = useRecoilComponentValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const hideEmptyRecordGroup = useRecoilComponentFamilyValue(
    recordIndexRecordGroupHideComponentFamilyState,
    viewType,
  );

  const recordGroupSort = useRecoilComponentValue(
    recordIndexRecordGroupSortComponentState,
  );

  const {
    handleVisibilityChange: handleRecordGroupVisibilityChange,
    handleHideEmptyRecordGroupChange,
  } = useRecordGroupVisibility({
    viewType,
  });
  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroupIds.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroupIds, currentContentId, onContentChange]);

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
    ...(currentView?.key !== 'INDEX' ? ['GroupBy', 'Sort'] : []),
    'HideEmptyGroups',
  ];

  const hiddenGroupsSelectableListId = `${OBJECT_OPTIONS_DROPDOWN_ID}-hidden-groups`;

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
        Group
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          {currentView?.key !== 'INDEX' && (
            <>
              <SelectableListItem
                itemId="GroupBy"
                onEnter={() => onContentChange('recordGroupFields')}
              >
                <MenuItem
                  focused={selectedItemId === 'GroupBy'}
                  onClick={() => onContentChange('recordGroupFields')}
                  LeftIcon={IconLayoutList}
                  text={t`Group by`}
                  contextualText={recordGroupFieldMetadata?.label}
                  hasSubMenu
                />
              </SelectableListItem>
              <SelectableListItem
                itemId="Sort"
                onEnter={() => onContentChange('recordGroupSort')}
              >
                <MenuItem
                  focused={selectedItemId === 'Sort'}
                  onClick={() => onContentChange('recordGroupSort')}
                  LeftIcon={IconSortDescending}
                  text={t`Sort`}
                  contextualText={recordGroupSort}
                  hasSubMenu
                />
              </SelectableListItem>
            </>
          )}
          <SelectableListItem
            itemId="HideEmptyGroups"
            onEnter={() => handleHideEmptyRecordGroupChange()}
          >
            <MenuItemToggle
              focused={selectedItemId === 'HideEmptyGroups'}
              LeftIcon={IconCircleOff}
              onToggleChange={handleHideEmptyRecordGroupChange}
              toggled={hideEmptyRecordGroup}
              text={t`Hide empty groups`}
              toggleSize="small"
            />
          </SelectableListItem>
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
                <MenuItemNavigate
                  onClick={() => onContentChange('hiddenRecordGroups')}
                  LeftIcon={IconEyeOff}
                  text={`Hidden ${recordGroupFieldMetadata?.label ?? ''}`}
                />
              </SelectableListItem>
            </SelectableList>
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
