import styled from '@emotion/styled';

import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useTheme } from '@emotion/react';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconPencil } from 'twenty-ui/display';
import { CodeEditor, FloatingIconButton } from 'twenty-ui/input';
import { JsonTree, isTwoFirstDepths } from 'twenty-ui/json-visualizer';
import { useJsonField } from '../../hooks/useJsonField';

type RawJsonFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

const CONTAINER_HEIGHT = 300;

const StyledContainer = styled.div`
  box-sizing: border-box;
  height: ${CONTAINER_HEIGHT}px;
  width: 400px;
  position: relative;
  overflow-y: auto;
`;

const StyledSwitchModeButtonContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
`;

const StyledCodeEditorContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledJsonTreeContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  width: min-content;
`;

export const RawJsonFieldInput = ({
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: RawJsonFieldInputProps) => {
  const theme = useTheme();

  const { draftValue, hotkeyScope, setDraftValue, persistJsonField } =
    useJsonField();

  const containerRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  const showEditButton = !isEditing;

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

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  return (
    <StyledContainer ref={containerRef}>
      {isEditing ? (
        <StyledCodeEditorContainer>
          <CodeEditor
            value={draftValue}
            language="application/json"
            height={CONTAINER_HEIGHT - 8}
            variant="borderless"
            options={{
              lineNumbers: 'off',
              folding: false,
              overviewRulerBorder: false,
              lineDecorationsWidth: 0,
            }}
            onChange={handleChange}
          />
        </StyledCodeEditorContainer>
      ) : (
        <>
          <StyledSwitchModeButtonContainer>
            <FloatingIconButton
              Icon={IconPencil}
              onClick={handleStartEditing}
            />
          </StyledSwitchModeButtonContainer>

          <StyledJsonTreeContainer>
            <JsonTree
              value={isDefined(draftValue) ? JSON.parse(draftValue) : ''}
              arrowButtonCollapsedLabel=""
              arrowButtonExpandedLabel=""
              emptyArrayLabel=""
              emptyObjectLabel=""
              emptyStringLabel=""
              shouldExpandNodeInitially={isTwoFirstDepths}
            />
          </StyledJsonTreeContainer>
        </>
      )}
    </StyledContainer>
  );
};
