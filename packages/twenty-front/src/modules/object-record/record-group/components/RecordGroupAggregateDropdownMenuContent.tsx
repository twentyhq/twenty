import { ListItem } from 'twenty-ui/primitives/navigation';
import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { RecordGroupAggregateDropdownContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownContext';
import { type RecordGroupAggregateDropdownContextValue } from '@/object-record/record-group/types/RecordGroupAggregateDropdownContextValue';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useLingui } from '@lingui/react/macro';

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
          onClick={() => {
            onContentChange('countAggregateOperationsOptions');
          }}
          hasSubmenu
        >{t`Count`}</ListItem>
        <ListItem
          onClick={() => {
            onContentChange('percentAggregateOperationsOptions');
          }}
          hasSubmenu
        >{t`Percent`}</ListItem>
        <ListItem
          onClick={() => {
            onContentChange('datesAggregateOperationOptions');
          }}
          hasSubmenu
        >{t`Date`}</ListItem>
        <ListItem
          onClick={() => {
            onContentChange('moreAggregateOperationOptions');
          }}
          hasSubmenu
        >{t`More options`}</ListItem>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
