import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
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
        dropdownPlacement="bottom-start"
        dropdownHotkeyScope={{ scope: column.key + '-header' }}
      />
    </DropdownScope>
  );
};
