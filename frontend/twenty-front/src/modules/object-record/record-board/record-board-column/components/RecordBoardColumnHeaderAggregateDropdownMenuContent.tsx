import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import {
  RecordBoardColumnHeaderAggregateDropdownContext,
  type RecordBoardColumnHeaderAggregateDropdownContextValue,
} from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useLingui } from '@lingui/react/macro';
import { MenuItem } from 'twenty-ui/navigation';

export const RecordBoardColumnHeaderAggregateDropdownMenuContent = () => {
  const { t } = useLingui();

  const { onContentChange } =
    useDropdownContextStateManagement<RecordBoardColumnHeaderAggregateDropdownContextValue>(
      {
        context: RecordBoardColumnHeaderAggregateDropdownContext,
      },
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
