import { type ReactElement } from 'react';

import { RecordTableCellBaseContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellBaseContainer';

import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';

export type RecordTableCellContainerProps = {
  nonEditModeContent: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export const RecordTableCellContainer = ({
  nonEditModeContent,
}: RecordTableCellContainerProps) => {
  return (
    <RecordTableCellBaseContainer>
      <RecordTableCellDisplayMode>
        {nonEditModeContent}
      </RecordTableCellDisplayMode>
    </RecordTableCellBaseContainer>
  );
};
