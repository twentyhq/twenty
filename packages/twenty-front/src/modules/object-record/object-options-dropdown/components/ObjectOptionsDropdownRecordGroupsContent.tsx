import { useEffect } from 'react';

import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupReorderConfirmationModal } from '@/object-record/record-group/hooks/useRecordGroupReorderConfirmationModal';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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
    recordIndexId,
    onContentChange,
    resetContent,
  } = useOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilyValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const hideEmptyRecordGroup = useRecoilComponentFamilyValueV2(
    recordIndexRecordGroupHideComponentFamilyState,
    viewType,
  );

  const recordGroupSort = useRecoilComponentValueV2(
    recordIndexRecordGroupSortComponentState,
  );

  const {
    handleVisibilityChange: handleRecordGroupVisibilityChange,
    handleHideEmptyRecordGroupChange,
  } = useRecordGroupVisibility({
    viewType,
  });

  const {
    handleRecordGroupOrderChangeWithModal,
    handleRecordGroupReorderConfirmClick,
  } = useRecordGroupReorderConfirmationModal({
    recordIndexId,
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

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
    ...(currentView?.key !== 'INDEX' ? ['GroupBy', 'Sort'] : []),
    'HideEmptyGroups',
  ];

  return (
    <>
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
          hotkeyScope={TableOptionsHotkeyScope.Dropdown}
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
              selectableListInstanceId={`${OBJECT_OPTIONS_DROPDOWN_ID}-hidden-groups`}
              hotkeyScope={TableOptionsHotkeyScope.Dropdown}
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
      <RecordGroupReorderConfirmationModal
        onConfirmClick={handleRecordGroupReorderConfirmClick}
      />
    </>
  );
};
