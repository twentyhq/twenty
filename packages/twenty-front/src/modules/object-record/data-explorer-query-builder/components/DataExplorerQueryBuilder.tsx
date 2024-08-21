import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { FieldDataExplorerQueryValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRef } from 'react';

interface DataExplorerQueryBuilderProps {
  value?: FieldDataExplorerQueryValue | undefined;
  hotkeyScope: string;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newValue: FieldDataExplorerQueryValue,
  ) => void;
  onEnter: (newValue: FieldDataExplorerQueryValue) => void;
  onEscape: (newValue: FieldDataExplorerQueryValue) => void;
  onTab?: (newValue: FieldDataExplorerQueryValue) => void;
  onShiftTab?: (newValue: FieldDataExplorerQueryValue) => void;
  onChange: (newValue: FieldDataExplorerQueryValue) => void;
}

export const DataExplorerQueryBuilder = (
  props: DataExplorerQueryBuilderProps,
) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    onClickOutside: props.onClickOutside,
    onEnter: props.onEnter,
    onEscape: props.onEscape,
    onTab: props.onTab,
    onShiftTab: props.onShiftTab,
    hotkeyScope: props.hotkeyScope,
    inputValue: props.value ?? {},
  });

  return <div ref={wrapperRef}>DataExplorerQueryBuilder</div>;
};
