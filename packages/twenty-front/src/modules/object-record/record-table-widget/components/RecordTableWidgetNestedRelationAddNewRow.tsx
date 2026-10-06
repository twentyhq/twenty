import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { RecordTableWidgetRelationPickerDropdownContent } from '@/object-record/record-table-widget/components/RecordTableWidgetRelationPickerDropdownContent';
import { type RecordTableWidgetNestedRelationCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
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
}: RecordTableWidgetNestedRelationAddNewRowProps) => (
  <DropdownRoot dropdownId={dropdownId} type="picker">
    <Dropdown.Trigger
      render={<div />}
      nativeButton={false}
      style={{ width: '100%' }}
    >
      <RecordTableActionRow LeftIcon={IconPlus} text={t`Add New`} />
    </Dropdown.Trigger>
    <DropdownContent align="start" width={200}>
      <RecordTableWidgetRelationPickerDropdownContent
        objectNameSingular={
          nestedRelationCreateThrough.relationObjectMetadataNameSingular
        }
        recordsFilter={nestedRelationCreateThrough.relationRecordsFilter}
        onRelationRecordSelected={onRelationRecordSelected}
      />
    </DropdownContent>
  </DropdownRoot>
);
