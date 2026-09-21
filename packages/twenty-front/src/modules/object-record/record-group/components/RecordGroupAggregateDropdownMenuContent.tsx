import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { RecordGroupAggregateDropdownContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownContext';
import { type RecordGroupAggregateDropdownContextValue } from '@/object-record/record-group/types/RecordGroupAggregateDropdownContextValue';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useLingui } from '@lingui/react/macro';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const RecordGroupAggregateDropdownMenuContent = () => {
  const { t } = useLingui();

  const { onContentChange } =
    useDropdownContextStateManagement<RecordGroupAggregateDropdownContextValue>(
      {
        context: RecordGroupAggregateDropdownContext,
      },
    );

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <ListItem
          onClick={getDropdownMenuItemClickHandler(() => {
            onContentChange('countAggregateOperationsOptions');
          })}
          hasSubmenu
        >
          <OverflowingTextWithTooltip text={t`Count`} />
        </ListItem>
        <ListItem
          onClick={getDropdownMenuItemClickHandler(() => {
            onContentChange('percentAggregateOperationsOptions');
          })}
          hasSubmenu
        >
          <OverflowingTextWithTooltip text={t`Percent`} />
        </ListItem>
        <ListItem
          onClick={getDropdownMenuItemClickHandler(() => {
            onContentChange('datesAggregateOperationOptions');
          })}
          hasSubmenu
        >
          <OverflowingTextWithTooltip text={t`Date`} />
        </ListItem>
        <ListItem
          onClick={getDropdownMenuItemClickHandler(() => {
            onContentChange('moreAggregateOperationOptions');
          })}
          hasSubmenu
        >
          <OverflowingTextWithTooltip text={t`More options`} />
        </ListItem>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
