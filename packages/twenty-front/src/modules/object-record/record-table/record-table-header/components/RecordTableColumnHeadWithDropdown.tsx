import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Dropdown } from 'twenty-ui/components';
import { RecordTableColumnHead } from './RecordTableColumnHead';
import { RecordTableColumnHeadDropdownMenu } from './RecordTableColumnHeadDropdownMenu';
import { RecordTableColumnHeadDropdownScrollEffect } from './RecordTableColumnHeadDropdownScrollEffect';

type RecordTableColumnHeadWithDropdownProps = {
  recordField: RecordField;
  objectMetadataId: string;
};

export const RecordTableColumnHeadWithDropdown = ({
  objectMetadataId,
  recordField,
}: RecordTableColumnHeadWithDropdownProps) => (
  <DropdownRoot
    type="menu"
    dropdownId={recordField.fieldMetadataItemId + '-header'}
  >
    <Dropdown.Trigger nativeButton={false} render={<div />}>
      <RecordTableColumnHead recordField={recordField} />
    </Dropdown.Trigger>
    <RecordTableColumnHeadDropdownScrollEffect />
    <DropdownContent
      side="bottom"
      align="start"
      alignOffset={-1}
      sideOffset={0}
    >
      <RecordTableColumnHeadDropdownMenu
        recordField={recordField}
        objectMetadataId={objectMetadataId}
      />
    </DropdownContent>
  </DropdownRoot>
);
