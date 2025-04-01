import styled from '@emotion/styled';

import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRef } from 'react';
import { Key } from 'ts-key-enum';
import { CodeEditor } from 'twenty-ui/input';
import { useJsonField } from '../../hooks/useJsonField';

type RawJsonFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

const StyledJsonTreeContainer = styled.div`
  box-sizing: border-box;
  height: 300px;
  width: 400px;
  max-width: 100vw;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export const RawJsonFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: RawJsonFieldInputProps) => {
  const { draftValue, hotkeyScope, setDraftValue, persistJsonField } =
    useJsonField();

  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = (newText: string) => {
    // onEnter?.(() => persistJsonField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistJsonField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistJsonField(newText), event);
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistJsonField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistJsonField(newText));
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      handleClickOutside(event, draftValue ?? '');
    },
    listenerId: hotkeyScope,
  });

  // useScopedHotkeys(
  //   Key.Enter,
  //   () => {
  //     handleEnter(draftValue ?? '');
  //   },
  //   hotkeyScope,
  //   [handleEnter, draftValue],
  // );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      handleEscape(draftValue ?? '');
    },
    hotkeyScope,
    [handleEscape, draftValue],
  );

  useScopedHotkeys(
    'tab',
    () => {
      handleTab(draftValue ?? '');
    },
    hotkeyScope,
    [handleTab, draftValue],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      handleShiftTab(draftValue ?? '');
    },
    hotkeyScope,
    [handleShiftTab, draftValue],
  );

  return (
    <StyledJsonTreeContainer ref={containerRef}>
      <CodeEditor
        value={draftValue}
        language="application/json"
        height={284}
        options={{
          lineNumbers: 'off',
        }}
        onChange={handleChange}
      />
    </StyledJsonTreeContainer>
  );
};
