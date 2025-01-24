import { Key } from 'ts-key-enum';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useRegisterInputEvents = <T>({
  inputRef,
  copyRef,
  inputValue,
  onEscape,
  onEnter,
  onTab,
  onShiftTab,
  onClickOutside,
  hotkeyScope,
}: {
  inputRef: React.RefObject<any>;
  copyRef?: React.RefObject<any>;
  inputValue: T;
  onEscape?: (inputValue: T) => void;
  onEnter?: (inputValue: T) => void;
  onTab?: (inputValue: T) => void;
  onShiftTab?: (inputValue: T) => void;
  onClickOutside?: (event: MouseEvent | TouchEvent, inputValue: T) => void;
  hotkeyScope: string;
}) => {
  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  const { recordId, fieldDefinition } = useContext(FieldContext);

  useListenClickOutside({
    refs: [inputRef, copyRef].filter(isDefined),
    callback: (event) => {
      const fieldDropdownFocusIdTableCell = getDropdownFocusIdForRecordField(
        recordId,
        fieldDefinition.fieldMetadataId,
        'table-cell',
      );

      const fieldDropdownFocusIdInlineCell = getDropdownFocusIdForRecordField(
        recordId,
        fieldDefinition.fieldMetadataId,
        'inline-cell',
      );

      if (
        activeDropdownFocusId !== fieldDropdownFocusIdTableCell &&
        activeDropdownFocusId !== fieldDropdownFocusIdInlineCell
      ) {
        return;
      }

      onClickOutside?.(event, inputValue);
    },
    enabled: isDefined(onClickOutside),
    listenerId: hotkeyScope,
  });

  useScopedHotkeys(
    'enter',
    () => {
      onEnter?.(inputValue);
    },
    hotkeyScope,
    [onEnter, inputValue],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onEscape?.(inputValue);
    },
    hotkeyScope,
    [onEscape, inputValue],
  );

  useScopedHotkeys(
    'tab',
    () => {
      onTab?.(inputValue);
    },
    hotkeyScope,
    [onTab, inputValue],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      onShiftTab?.(inputValue);
    },
    hotkeyScope,
    [onShiftTab, inputValue],
  );
};
