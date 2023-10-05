import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

import { ColumnHead } from './ColumnHead';
import { TableColumnDropdownMenu } from './TableColumnDropdownMenu';

type ColumnHeadProps = {
  column: ColumnDefinition<FieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

export const ColumnHeadWithDropdown = ({
  column,
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
}: ColumnHeadProps) => {
  return (
    <DropdownMenu
      clickableComponent={<ColumnHead column={column} />}
      dropdownId={column.key + '-header'}
      dropdownComponents={
        <TableColumnDropdownMenu
          column={column}
          isFirstColumn={isFirstColumn}
          isLastColumn={isLastColumn}
          primaryColumnKey={primaryColumnKey}
        />
      }
      dropdownHotkeyScope={{ scope: column.key + '-header' }}
    />
  );
};
