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
import { useRecordGroupReorderConfirmationModal } from '@/object-record/record-group/hooks/useRecordGroupReorderConfirmationModal';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { visibleRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentSelector';
import { recordIndexRecordGroupHideComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const ObjectOptionsDropdownRecordGroupsContent = () => {
  const isViewGroupEnabled = useIsFeatureEnabled('IS_VIEW_GROUPS_ENABLED');

  const { currentContentId, recordIndexId, onContentChange, resetContent } =
    useOptionsDropdown();

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const visibleRecordGroupIds = useRecoilComponentValueV2(
    visibleRecordGroupIdsComponentSelector,
  );

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const hideEmptyRecordGroup = useRecoilComponentValueV2(
    recordIndexRecordGroupHideComponentState,
  );

  const recordGroupSort = useRecoilComponentValueV2(
    recordIndexRecordGroupSortComponentState,
  );

  const {
    handleVisibilityChange: handleRecordGroupVisibilityChange,
    handleHideEmptyRecordGroupChange,
  } = useRecordGroupVisibility({
    viewBarId: recordIndexId,
  });

  const {
    handleRecordGroupOrderChangeWithModal,
    RecordGroupReorderConfirmationModal,
  } = useRecordGroupReorderConfirmationModal(recordIndexId);

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
        {isViewGroupEnabled && (
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
      {RecordGroupReorderConfirmationModal}
    </>
  );
};
