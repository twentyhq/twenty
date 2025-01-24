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
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupReorderConfirmationModal } from '@/object-record/record-group/hooks/useRecordGroupReorderConfirmationModal';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

export const ObjectOptionsDropdownRecordGroupsContent = () => {
  const {
    viewType,
    currentContentId,
    recordIndexId,
    onContentChange,
    resetContent,
  } = useOptionsDropdown();

  const { currentViewWithCombinedFiltersAndSorts: currentView } =
    useGetCurrentView();

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
    viewBarId: recordIndexId,
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

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        Group by
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {currentView?.key !== 'INDEX' && (
          <>
            <MenuItem
              onClick={() => onContentChange('recordGroupFields')}
              LeftIcon={IconLayoutList}
              text="Group by"
              contextualText={recordGroupFieldMetadata?.label}
              hasSubMenu
            />
            <MenuItem
              onClick={() => onContentChange('recordGroupSort')}
              LeftIcon={IconSortDescending}
              text="Sort"
              contextualText={recordGroupSort}
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
      {visibleRecordGroupIds.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <RecordGroupsVisibilityDropdownSection
            title="Visible groups"
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
          <DropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => onContentChange('hiddenRecordGroups')}
              LeftIcon={IconEyeOff}
              text={`Hidden ${recordGroupFieldMetadata?.label ?? ''}`}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      <RecordGroupReorderConfirmationModal
        onConfirmClick={handleRecordGroupReorderConfirmClick}
      />
    </>
  );
};
