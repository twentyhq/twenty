import { useCreateNewBoardRecord } from '@/object-record/record-board/hooks/useCreateNewBoardRecord';
import { visibleRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentSelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { PageAddButton } from '@/ui/layout/page/components/PageAddButton';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordIndexPageKanbanAddButton = () => {
  const dropdownId = `record-index-page-add-button-dropdown`;

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordGroupIds = useRecoilComponentValueV2(
    visibleRecordGroupIdsComponentSelector,
  );

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );

  const { closeDropdown } = useDropdown(dropdownId);

  const { createNewBoardRecord } = useCreateNewBoardRecord(recordIndexId);

  const handleItemClick = useCallback(
    (columnDefinition: RecordGroupDefinition) => {
      createNewBoardRecord(columnDefinition.id, 'first');
      closeDropdown();
    },
    [createNewBoardRecord, closeDropdown],
  );

  if (!selectFieldMetadataItem) {
    return null;
  }

  return (
    <Dropdown
      dropdownMenuWidth="200px"
      dropdownPlacement="bottom-start"
      clickableComponent={<PageAddButton />}
      dropdownId={dropdownId}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {visibleRecordGroupIds.map((recordGroupId) => (
            <RecordIndexPageKanbanAddMenuItem
              key={recordGroupId}
              columnId={recordGroupId}
              onItemClick={handleItemClick}
            />
          ))}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
