import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type RecordBoardCardInputContextProviderProps = {
  children: React.ReactNode;
};

export const RecordBoardCardInputContextProvider = ({
  children,
}: RecordBoardCardInputContextProviderProps) => {
  const { closeInlineCell } = useInlineCell();
  const setRecordBoardCardEditModePosition = useSetRecoilComponentState(
    recordBoardCardEditModePositionComponentState,
  );

  const closeInlineCellAndResetEditModePosition = useCallback(() => {
    setRecordBoardCardEditModePosition(null);
    closeInlineCell();
  }, [closeInlineCell, setRecordBoardCardEditModePosition]);

  const instanceId = useAvailableComponentInstanceId(
    RecordFieldComponentInstanceContext,
  );

  const { persistFieldFromFieldInputContext } =
    usePersistFieldFromFieldInputContext();

  const handleEnter: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCellAndResetEditModePosition();
  };

  const handleSubmit: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCellAndResetEditModePosition();
  };

  const handleCancel = () => {
    closeInlineCellAndResetEditModePosition();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = useRecoilCallback(
    ({ snapshot }) =>
      ({ newValue, event, skipPersist }) => {
        const currentFocusId = snapshot
          .getLoadable(currentFocusIdSelector)
          .getValue();

        if (currentFocusId !== instanceId) {
          return;
        }
        event?.preventDefault();
        event?.stopImmediatePropagation();

        if (skipPersist !== true) {
          persistFieldFromFieldInputContext(newValue);
        }

        closeInlineCellAndResetEditModePosition();
      },
    [
      closeInlineCellAndResetEditModePosition,
      instanceId,
      persistFieldFromFieldInputContext,
    ],
  );

  const handleEscape: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCellAndResetEditModePosition();
  };

  const handleTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCellAndResetEditModePosition();
  };

  const handleShiftTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCellAndResetEditModePosition();
  };

  return (
    <FieldInputEventContext.Provider
      value={{
        onCancel: handleCancel,
        onEnter: handleEnter,
        onEscape: handleEscape,
        onClickOutside: handleClickOutside,
        onShiftTab: handleShiftTab,
        onSubmit: handleSubmit,
        onTab: handleTab,
      }}
    >
      {children}
    </FieldInputEventContext.Provider>
  );
};
