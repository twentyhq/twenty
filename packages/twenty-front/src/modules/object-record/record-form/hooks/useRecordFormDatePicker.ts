import { useIsDatePickerDropdownOpen } from '@/ui/input/components/internal/date/hooks/useIsDatePickerDropdownOpen';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { doNotTranslate } from 'twenty-shared/i18n';

type UseRecordFormDatePickerProps = {
  instanceId: string;
  clickOutsideId: string;
};

export const useRecordFormDatePicker = ({
  instanceId,
  clickOutsideId,
}: UseRecordFormDatePickerProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open: isPickerOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(4), flip()],
    whileElementsMounted: autoUpdate,
  });

  const { isDatePickerDropdownOpen } = useIsDatePickerDropdownOpen();

  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => setIsPickerOpen(false);

  useListenClickOutside({
    refs: [wrapperRef],
    listenerId: doNotTranslate(`RecordFormDatePicker-${instanceId}`),
    callback: (event) => {
      if (isDatePickerDropdownOpen(instanceId)) {
        return;
      }

      event.stopImmediatePropagation();
      closePicker();
    },
    enabled: isPickerOpen,
    excludedClickOutsideIds: [clickOutsideId],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: closePicker,
    focusId: instanceId,
    dependencies: [closePicker],
  });

  return {
    isPickerOpen,
    openPicker,
    closePicker,
    wrapperRef,
    setReference: refs.setReference,
    setFloating: refs.setFloating,
    floatingStyles,
  };
};
