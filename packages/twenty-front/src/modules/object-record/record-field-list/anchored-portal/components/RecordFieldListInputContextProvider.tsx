import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useRecoilCallback } from 'recoil';

type RecordFieldListInputContextProviderProps = {
  children: React.ReactNode;
};

export const RecordFieldListInputContextProvider = ({
  children,
}: RecordFieldListInputContextProviderProps) => {
  const { onCloseEditMode } = useRecordInlineCellContext();

  const instanceId = useAvailableComponentInstanceId(
    RecordFieldComponentInstanceContext,
  );

  const { persistFieldFromFieldInputContext } =
    usePersistFieldFromFieldInputContext();

  const handleEnter: FieldInputEvent = ({ newValue, skipPersist }) => {
    console.log('handleEnter');
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    onCloseEditMode?.();
  };

  const handleSubmit: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    onCloseEditMode?.();
  };

  const handleCancel = () => {
    onCloseEditMode?.();
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

        onCloseEditMode?.();
      },
    [onCloseEditMode, instanceId, persistFieldFromFieldInputContext],
  );

  const handleEscape: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    onCloseEditMode?.();
  };

  const handleTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    onCloseEditMode?.();
  };

  const handleShiftTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    onCloseEditMode?.();
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
