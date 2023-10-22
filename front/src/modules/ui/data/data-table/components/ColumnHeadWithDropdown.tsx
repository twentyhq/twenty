import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';

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
      <Dropdown
        clickableComponent={<ColumnHead column={column} />}
        dropdownComponents={
          <DataTableColumnDropdownMenu
            column={column}
            isFirstColumn={isFirstColumn}
            isLastColumn={isLastColumn}
            primaryColumnKey={primaryColumnKey}
          />
        }
        dropdownOffset={{ x: -1 }}
        dropdownPlacement="bottom-start"
        dropdownHotkeyScope={{ scope: column.key + '-header' }}
      />
    </DropdownScope>
  );
};
