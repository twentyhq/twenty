import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { availableRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/availableRecordGroupIdsComponentSelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';

type RecordIndexAddRecordInGroupDropdownProps = {
  dropdownId: string;
  clickableComponent: React.ReactNode;
};

export const RecordIndexAddRecordInGroupDropdown = ({
  dropdownId,
  clickableComponent,
}: RecordIndexAddRecordInGroupDropdownProps) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const recordGroupIds = useRecoilComponentValueV2(
    availableRecordGroupIdsComponentSelector,
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

  const { closeDropdown } = useDropdown(dropdownId);

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const handleCreateNewTableRecordInGroup = useRecoilCallback(
    ({ set }) =>
      (recordGroup: RecordGroupDefinition) => {
        set(isRecordGroupTableSectionToggledState(recordGroup.id), true);
        setActiveDropdownFocusIdAndMemorizePrevious(null);
        if (!selectFieldMetadataItem) {
          return;
        }
        createNewIndexRecord({
          [selectFieldMetadataItem.name]: recordGroup.value,
        });
        closeDropdown();
      },
    [
      isRecordGroupTableSectionToggledState,
      setActiveDropdownFocusIdAndMemorizePrevious,
      selectFieldMetadataItem,
      createNewIndexRecord,
      closeDropdown,
    ],
  );

  if (!selectFieldMetadataItem) {
    return null;
  }

  return (
    <Dropdown
      dropdownMenuWidth="200px"
      dropdownPlacement="bottom-start"
      clickableComponent={clickableComponent}
      dropdownId={dropdownId}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {recordGroupIds.map((recordGroupId) => (
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
