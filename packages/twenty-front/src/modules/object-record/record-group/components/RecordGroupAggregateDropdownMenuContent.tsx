import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
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
        <DropdownListItem
          onClick={() => {
            onContentChange('countAggregateOperationsOptions');
          }}
          hasSubmenu
        >{t`Count`}</DropdownListItem>
        <DropdownListItem
          onClick={() => {
            onContentChange('percentAggregateOperationsOptions');
          }}
          hasSubmenu
        >{t`Percent`}</DropdownListItem>
        <DropdownListItem
          onClick={() => {
            onContentChange('datesAggregateOperationOptions');
          }}
          hasSubmenu
        >{t`Date`}</DropdownListItem>
        <DropdownListItem
          onClick={() => {
            onContentChange('moreAggregateOperationOptions');
          }}
          hasSubmenu
        >{t`More options`}</DropdownListItem>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
