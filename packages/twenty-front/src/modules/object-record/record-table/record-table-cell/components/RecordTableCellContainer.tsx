import { ReactElement, useContext } from 'react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellBaseContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellBaseContainer';
import { RecordTableCellSoftFocusMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSoftFocusMode';

import { RecordTableCellSoftFocusModeHotkeysSetterEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSoftFocusModeHotkeysSetterEffect';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useRecoilValue } from 'recoil';
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
  const { hasSoftFocus, isInEditMode } = useContext(RecordTableCellContext);

  const currentHotkeyScope = useRecoilValue(currentHotkeyScopeState);

  return (
    <RecordTableCellBaseContainer>
      {isInEditMode ? (
        <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
      ) : hasSoftFocus ? (
        <>
          {currentHotkeyScope.scope === TableHotkeyScope.TableSoftFocus && (
            <RecordTableCellSoftFocusModeHotkeysSetterEffect />
          )}
          <RecordTableCellSoftFocusMode
            editModeContent={editModeContent}
            nonEditModeContent={nonEditModeContent}
          />
        </>
      ) : (
        <RecordTableCellDisplayMode>
          {nonEditModeContent}
        </RecordTableCellDisplayMode>
      )}
    </RecordTableCellBaseContainer>
  );
};
