import { OverflowingTextTooltipModeProvider } from 'twenty-ui/primitives/typography';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldFocusStaticUnfocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordTableCellBaseContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellBaseContainer';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';

export const RecordTableCell = () => {
  return (
    <FieldFocusStaticUnfocusedProvider>
      <OverflowingTextTooltipModeProvider mode="disabled">
        <RecordTableCellBaseContainer>
          <RecordTableCellDisplayMode>
            <FieldDisplay />
          </RecordTableCellDisplayMode>
        </RecordTableCellBaseContainer>
      </OverflowingTextTooltipModeProvider>
    </FieldFocusStaticUnfocusedProvider>
  );
};
