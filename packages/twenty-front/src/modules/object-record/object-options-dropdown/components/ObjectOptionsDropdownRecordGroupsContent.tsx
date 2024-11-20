import { useEffect } from 'react';
import {
  IconChevronLeft,
  IconCircleOff,
  IconEyeOff,
  IconLayoutList,
  IconSortDescending,
  MenuItem,
  MenuItemNavigate,
  MenuItemToggle,
} from 'twenty-ui';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordIndexRecordGroupHideComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const ObjectOptionsDropdownRecordGroupsContent = () => {
  const isViewGroupEnabled = useIsFeatureEnabled('IS_VIEW_GROUPS_ENABLED');

  const {
    currentContentId,
    viewType,
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    resetContent,
  } = useOptionsDropdown();

  const {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
  } = useRecordGroups({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const isDragableSortRecordGroup = useRecoilComponentValueV2(
    recordIndexRecordGroupIsDraggableSortComponentSelector,
  );

  const hideEmptyRecordGroup = useRecoilComponentValueV2(
    recordIndexRecordGroupHideComponentState,
  );

  const {
    handleVisibilityChange: handleRecordGroupVisibilityChange,
    handleHideEmptyRecordGroupChange,
  } = useRecordGroupVisibility({
    viewBarId: recordIndexId,
    viewType,
  });

  const { handleOrderChange: handleRecordGroupOrderChange } =
    useRecordGroupReorder({
      objectNameSingular: objectMetadataItem.nameSingular,
      viewBarId: recordIndexId,
    });

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroups.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroups, currentContentId, onContentChange]);

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        Group by
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {isViewGroupEnabled && (
          <>
            <MenuItem
              onClick={() => onContentChange('recordGroupFields')}
              LeftIcon={IconLayoutList}
              text={
                !viewGroupFieldMetadataItem
                  ? 'Group by'
                  : `Group by "${viewGroupFieldMetadataItem.label}"`
              }
              hasSubMenu
            />
            <MenuItem
              onClick={() => onContentChange('recordGroupSort')}
              LeftIcon={IconSortDescending}
              text="Sort"
              hasSubMenu
            />
          </>
        )}
        <MenuItemToggle
          LeftIcon={IconCircleOff}
          onToggleChange={handleHideEmptyRecordGroupChange}
          toggled={hideEmptyRecordGroup}
          text="Hide empty groups"
          toggleSize="small"
        />
      </DropdownMenuItemsContainer>
      {visibleRecordGroups.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <RecordGroupsVisibilityDropdownSection
            title="Visible groups"
            recordGroups={visibleRecordGroups}
            onDragEnd={handleRecordGroupOrderChange}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable={isDragableSortRecordGroup}
            showDragGrip={true}
          />
        </>
      )}
      {hiddenRecordGroups.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => onContentChange('hiddenRecordGroups')}
              LeftIcon={IconEyeOff}
              text={`Hidden ${viewGroupFieldMetadataItem?.label ?? ''}`}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </>
  );
};
