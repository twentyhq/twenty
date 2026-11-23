import { OverflowingTextTooltipModeProvider } from 'twenty-ui/primitives/typography';

import { FieldFocusStaticUnfocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordTableCellBaseContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellBaseContainer';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellFieldDisplay } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldDisplay';

export const RecordTableCell = () => {
  return (
    <FieldFocusStaticUnfocusedProvider>
      <OverflowingTextTooltipModeProvider mode="disabled">
        <RecordTableCellBaseContainer>
          <RecordTableCellDisplayMode>
            <RecordTableCellFieldDisplay />
          </RecordTableCellDisplayMode>
        </RecordTableCellBaseContainer>
      </OverflowingTextTooltipModeProvider>
    </FieldFocusStaticUnfocusedProvider>
  );
};
