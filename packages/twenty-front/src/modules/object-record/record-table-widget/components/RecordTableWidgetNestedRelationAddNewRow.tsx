import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { RecordTableWidgetRelationPickerDropdownContent } from '@/object-record/record-table-widget/components/RecordTableWidgetRelationPickerDropdownContent';
import { type RecordTableWidgetNestedRelationCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';

type RecordTableWidgetNestedRelationAddNewRowProps = {
  dropdownId: string;
  nestedRelationCreateThrough: RecordTableWidgetNestedRelationCreateThrough;
  onRelationRecordSelected: (relationRecordId: string) => void;
};

export const RecordTableWidgetNestedRelationAddNewRow = ({
  dropdownId,
  nestedRelationCreateThrough,
  onRelationRecordSelected,
}: RecordTableWidgetNestedRelationAddNewRowProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleRelationRecordSelected = (relationRecordId: string) => {
    closeDropdown(dropdownId);
    onRelationRecordSelected(relationRecordId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponentWidth="100%"
      clickableComponent={
        <RecordTableActionRow LeftIcon={IconPlus} text={t`Add New`} />
      }
      dropdownComponents={
        <RecordTableWidgetRelationPickerDropdownContent
          objectNameSingular={
            nestedRelationCreateThrough.relationObjectMetadataNameSingular
          }
          recordsFilter={nestedRelationCreateThrough.relationRecordsFilter}
          onRelationRecordSelected={handleRelationRecordSelected}
        />
      }
    />
  );
};
