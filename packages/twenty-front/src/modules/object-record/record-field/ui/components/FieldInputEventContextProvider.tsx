import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type FieldInputEventContextProviderProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export const FieldInputEventContextProvider = ({
  children,
  onClose,
}: FieldInputEventContextProviderProps) => {
  const store = useStore();

  const instanceId = useAvailableComponentInstanceId(
    RecordFieldComponentInstanceContext,
  );

  const { persistFieldFromFieldInputContext } =
    usePersistFieldFromFieldInputContext();

  const persistAndClose: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    onClose();
  };

  const handleSubmit: FieldInputEvent = ({
    newValue,
    skipPersist,
    skipClose,
  }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    if (skipClose !== true) {
      onClose();
    }
  };

  const handleClickOutside: FieldInputClickOutsideEvent = useCallback(
    ({ newValue, event, skipPersist }) => {
      const currentFocusId = store.get(currentFocusIdSelector.atom);

      if (currentFocusId !== instanceId) {
        return;
      }

      event?.preventDefault();
      event?.stopImmediatePropagation();

      if (skipPersist !== true) {
        persistFieldFromFieldInputContext(newValue);
      }

      onClose();
    },
    [onClose, instanceId, persistFieldFromFieldInputContext, store],
  );

  return (
    <FieldInputEventContext.Provider
      value={{
        onCancel: onClose,
        onEnter: persistAndClose,
        onEscape: persistAndClose,
        onClickOutside: handleClickOutside,
        onShiftTab: persistAndClose,
        onSubmit: handleSubmit,
        onTab: persistAndClose,
      }}
    >
      {children}
    </FieldInputEventContext.Provider>
  );
};
