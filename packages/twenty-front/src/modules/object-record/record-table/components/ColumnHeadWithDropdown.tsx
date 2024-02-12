import styled from '@emotion/styled';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { ColumnHead } from './ColumnHead';
import { RecordTableColumnDropdownMenu } from './RecordTableColumnDropdownMenu';

type ColumnHeadWithDropdownProps = {
  column: ColumnDefinition<FieldMetadata>;
};

const StyledDropdown = styled(Dropdown)`
  display: flex;
  flex: 1;
`;

export const ColumnHeadWithDropdown = ({
  column,
}: ColumnHeadWithDropdownProps) => {
  return (
    <StyledDropdown
      dropdownId={column.fieldMetadataId + '-header'}
      clickableComponent={<ColumnHead column={column} />}
      dropdownComponents={<RecordTableColumnDropdownMenu column={column} />}
      dropdownOffset={{ x: -1 }}
      dropdownPlacement="bottom-start"
      dropdownHotkeyScope={{ scope: column.fieldMetadataId + '-header' }}
    />
  );
};
