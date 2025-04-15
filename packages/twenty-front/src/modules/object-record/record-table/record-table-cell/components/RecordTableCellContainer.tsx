import { ReactElement, useContext } from 'react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellBaseContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellBaseContainer';

import { RecordTableCellFocusModeHotkeysSetterEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusModeHotkeysSetterEffect';
import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';

export type RecordTableCellContainerProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export const RecordTableCellContainer = ({
  editModeContent,
  nonEditModeContent,
}: RecordTableCellContainerProps) => {
  const { hasFocus, isInEditMode } = useContext(RecordTableCellContext);

  return (
    <RecordTableCellBaseContainer>
      {isInEditMode ? (
        <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
      ) : (
        <RecordTableCellDisplayMode>
          {nonEditModeContent}
        </RecordTableCellDisplayMode>
      )}
      {hasFocus ? <RecordTableCellFocusModeHotkeysSetterEffect /> : null}
    </RecordTableCellBaseContainer>
  );
};
