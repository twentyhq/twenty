import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownScope } from '@/ui/dropdown/scopes/DropdownScope';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

import { ColumnHead } from './ColumnHead';
import { DataTableColumnDropdownMenu } from './DataTableColumnDropdownMenu';

type ColumnHeadWithDropdownProps = {
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
}: ColumnHeadWithDropdownProps) => {
  return (
    <DropdownScope dropdownScopeId={column.key + '-header'}>
      <DropdownMenu
        clickableComponent={<ColumnHead column={column} />}
        dropdownComponents={
          <DataTableColumnDropdownMenu
            column={column}
            isFirstColumn={isFirstColumn}
            isLastColumn={isLastColumn}
            primaryColumnKey={primaryColumnKey}
          />
        }
        dropdownHotkeyScope={{ scope: column.key + '-header' }}
        dropdownOffset={{ x: 0, y: -8 }}
      />
    </DropdownScope>
  );
};
