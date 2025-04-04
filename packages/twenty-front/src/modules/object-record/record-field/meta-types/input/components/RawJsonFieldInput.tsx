import styled from '@emotion/styled';

import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconEye, IconPencil } from 'twenty-ui/display';
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

const StyledJsonTreeContainer = styled.div`
  box-sizing: border-box;
  height: 300px;
  width: 400px;
  max-width: 100vw;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  overflow-y: auto;
`;

const StyledSwitchModeButtonContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  z-index: 10;
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

  const [isEditing, setIsEditing] = useState(false);

  const parsedDraftJsonValue = isDefined(draftValue)
    ? JSON.parse(draftValue)
    : undefined;

  const showEditButton = true;

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

  const handleToggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <StyledJsonTreeContainer ref={containerRef}>
      {showEditButton && (
        <StyledSwitchModeButtonContainer>
          <FloatingIconButton
            Icon={isEditing ? IconEye : IconPencil}
            onClick={handleToggleEditing}
          />
        </StyledSwitchModeButtonContainer>
      )}

      {isEditing ? (
        <CodeEditor
          value={draftValue}
          language="application/json"
          height={284}
          options={{
            lineNumbers: 'off',
          }}
          onChange={handleChange}
        />
      ) : (
        <JsonTree
          value={parsedDraftJsonValue ?? ''}
          arrowButtonCollapsedLabel=""
          arrowButtonExpandedLabel=""
          emptyArrayLabel=""
          emptyObjectLabel=""
          emptyStringLabel=""
          shouldExpandNodeInitially={isTwoFirstDepths}
        />
      )}
    </StyledJsonTreeContainer>
  );
};
