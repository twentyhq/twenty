import { Key } from 'ts-key-enum';

import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import {
  RecordBoardColumnHeaderAggregateDropdownContext,
  RecordBoardColumnHeaderAggregateDropdownContextValue,
} from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';

import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useLingui } from '@lingui/react/macro';
import { MenuItem } from 'twenty-ui/navigation';

export const RecordBoardColumnHeaderAggregateDropdownMenuContent = () => {
  const { t } = useLingui();

  const { onContentChange, closeDropdown } =
    useDropdownContextStateManagement<RecordBoardColumnHeaderAggregateDropdownContextValue>(
      {
        context: RecordBoardColumnHeaderAggregateDropdownContext,
      },
    );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={() => {
            onContentChange('countAggregateOperationsOptions');
          }}
          text={t`Count`}
          hasSubMenu
        />
        <MenuItem
          onClick={() => {
            onContentChange('percentAggregateOperationsOptions');
          }}
          text={t`Percent`}
          hasSubMenu
        />
        <MenuItem
          onClick={() => {
            onContentChange('datesAggregateOperationOptions');
          }}
          text={t`Date`}
          hasSubMenu
        />
        <MenuItem
          onClick={() => {
            onContentChange('moreAggregateOperationOptions');
          }}
          text={t`More options`}
          hasSubMenu
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
