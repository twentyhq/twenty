import {
  FieldInputEventContext,
  type FieldInputClickOutsideEvent,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistFieldFromFieldInputContext } from '@/object-record/record-field/ui/hooks/usePersistFieldFromFieldInputContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

type FieldWidgetInputContextProviderProps = {
  children: React.ReactNode;
};

export const FieldWidgetInputContextProvider = ({
  children,
}: FieldWidgetInputContextProviderProps) => {
  const { closeInlineCell } = useInlineCell();

  const instanceId = useAvailableComponentInstanceId(
    RecordFieldComponentInstanceContext,
  );

  const { persistFieldFromFieldInputContext } =
    usePersistFieldFromFieldInputContext();

  const handleEnter: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleSubmit: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleCancel = () => {
    closeInlineCell();
  };

  const handleClickOutside: FieldInputClickOutsideEvent = useCallback(
    ({ newValue, event, skipPersist }) => {
      const currentFocusId = jotaiStore.get(currentFocusIdSelector.atom);

      if (currentFocusId !== instanceId) {
        return;
      }
      event?.preventDefault();
      event?.stopImmediatePropagation();

      if (skipPersist !== true) {
        persistFieldFromFieldInputContext(newValue);
      }

      closeInlineCell();
    },
    [closeInlineCell, instanceId, persistFieldFromFieldInputContext],
  );

  const handleEscape: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
  };

  const handleShiftTab: FieldInputEvent = ({ newValue, skipPersist }) => {
    if (skipPersist !== true) {
      persistFieldFromFieldInputContext(newValue);
    }

    closeInlineCell();
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
