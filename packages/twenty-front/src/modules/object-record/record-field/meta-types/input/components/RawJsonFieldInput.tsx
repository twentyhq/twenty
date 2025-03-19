import styled from '@emotion/styled';

import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconPencil } from 'twenty-ui/display';
import { CodeEditor, FloatingIconButton } from 'twenty-ui/input';
import { isTwoFirstDepths, JsonTree } from 'twenty-ui/json-visualizer';
import { useJsonField } from '../../hooks/useJsonField';

type RawJsonFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

const StyledJsonTreeContainer = styled.div`
  height: 300px;
  width: 400px;
  padding: ${({ theme }) => theme.spacing(2)};
  overflow: auto;
  position: relative;
`;

const StyledSwitchModeButtonContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
`;

export const RawJsonFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: RawJsonFieldInputProps) => {
  const {
    fieldDefinition,
    draftValue,
    hotkeyScope,
    setDraftValue,
    persistJsonField,
  } = useJsonField();

  const [isEditing, setIsEditing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistJsonField(newText));
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

  const handleSwitchMode = () => {
    setIsEditing(!isEditing);
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      handleClickOutside(event, draftValue ?? '');
    },
    listenerId: hotkeyScope,
  });

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleEnter(draftValue ?? '');
    },
    hotkeyScope,
    [handleEnter, draftValue],
  );

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
      {isEditing ? (
        <CodeEditor
          value={draftValue}
          language="application/json"
          height={292}
          options={{
            lineNumbers: 'off',
          }}
        />
      ) : (
        <JsonTree
          value={JSON.parse(draftValue ?? '')}
          arrowButtonCollapsedLabel=""
          arrowButtonExpandedLabel=""
          emptyArrayLabel=""
          emptyObjectLabel=""
          emptyStringLabel=""
          shouldExpandNodeInitially={isTwoFirstDepths}
        />
      )}

      <StyledSwitchModeButtonContainer>
        <FloatingIconButton Icon={IconPencil} onClick={handleSwitchMode} />
      </StyledSwitchModeButtonContainer>
    </StyledJsonTreeContainer>
  );
};
