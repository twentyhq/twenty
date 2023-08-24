import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { type TableView } from '../../states/tableViewsState';

import { TableOptionsDropdownButton } from './TableOptionsDropdownButton';
import { TableOptionsDropdownContent } from './TableOptionsDropdownContent';

type TableOptionsDropdownProps = {
  onColumnsChange?: (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => void;
  onViewsChange?: (views: TableView[]) => void;
  onImport?: () => void;
  customHotkeyScope: HotkeyScope;
};

export function TableOptionsDropdown({
  onColumnsChange,
  onViewsChange,
  onImport,
  customHotkeyScope,
}: TableOptionsDropdownProps) {
  return (
    <DropdownButton
      buttonComponents={<TableOptionsDropdownButton />}
      dropdownHotkeyScope={customHotkeyScope}
      dropdownKey="options"
      dropdownComponents={
        <TableOptionsDropdownContent
          onColumnsChange={onColumnsChange}
          onImport={onImport}
          onViewsChange={onViewsChange}
        />
      }
    />
  );
}
