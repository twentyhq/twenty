import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { visibleRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentSelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useCreateNewTableRecordInGroup } from '@/object-record/record-table/hooks/useCreateNewTableRecordInGroup';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { PageAddButton } from '@/ui/layout/page/components/PageAddButton';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';

export const RecordIndexPageTableAddButtonInGroup = () => {
  const dropdownId = `record-index-page-table-add-button-dropdown`;

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordGroupIds = useRecoilComponentValueV2(
    visibleRecordGroupIdsComponentSelector,
  );

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const isRecordGroupTableSectionToggledState =
    useRecoilComponentCallbackStateV2(
      isRecordGroupTableSectionToggledComponentState,
    );

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordGroupFieldMetadata?.id,
  );

  const { createNewTableRecordInGroup } = useCreateNewTableRecordInGroup();

  const { closeDropdown } = useDropdown(dropdownId);

  const handleCreateNewTableRecordInGroup = useRecoilCallback(
    ({ set }) =>
      (recordGroup: RecordGroupDefinition) => {
        set(isRecordGroupTableSectionToggledState(recordGroup.id), true);
        createNewTableRecordInGroup(recordGroup.id);
        closeDropdown();
      },
    [
      closeDropdown,
      createNewTableRecordInGroup,
      isRecordGroupTableSectionToggledState,
    ],
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
              onItemClick={handleCreateNewTableRecordInGroup}
            />
          ))}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
