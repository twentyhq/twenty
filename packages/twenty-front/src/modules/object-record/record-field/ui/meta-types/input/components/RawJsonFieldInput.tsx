import styled from '@emotion/styled';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useLingui } from '@lingui/react/macro';
import { useContext, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconPencil } from 'twenty-ui/display';
import { CodeEditor, FloatingIconButton } from 'twenty-ui/input';
import { JsonTree, isTwoFirstDepths } from 'twenty-ui/json-visualizer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useJsonField } from '@/object-record/record-field/ui/meta-types/hooks/useJsonField';

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

export const RawJsonFieldInput = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const { draftValue, precomputedDraftValue, setDraftValue, fieldDefinition } =
    useJsonField();

  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const { onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const [isEditing, setIsEditing] = useState(false);

  const parseJsonField = (
    nextValue: string,
  ): { success: boolean; value?: any } => {
    if (!nextValue) {
      return {
        success: true,
        value: null,
      };
    }

    try {
      return { success: true, value: JSON.parse(nextValue) };
    } catch {
      return { success: false };
    }
  };

  const handleEscape = (newText: string) => {
    const { success, value } = parseJsonField(newText);

    onEscape?.({ newValue: value, skipPersist: !success });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    const { success, value } = parseJsonField(newText);

    onClickOutside?.({ newValue: value, skipPersist: !success, event });
  };

  const handleTab = (newText: string) => {
    const { success, value } = parseJsonField(newText);

    onTab?.({ newValue: value, skipPersist: !success });
  };

  const handleShiftTab = (newText: string) => {
    const { success, value } = parseJsonField(newText);

    onShiftTab?.({ newValue: value, skipPersist: !success });
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      handleClickOutside(event, draftValue ?? '');
    },
    listenerId: instanceId,
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      handleEscape(draftValue ?? '');
    },
    focusId: instanceId,
    dependencies: [handleEscape, draftValue],
  });

  useHotkeysOnFocusedElement({
    keys: ['tab'],
    callback: () => {
      handleTab(draftValue ?? '');
    },
    focusId: instanceId,
    dependencies: [handleTab, draftValue],
  });

  useHotkeysOnFocusedElement({
    keys: ['shift+tab'],
    callback: () => {
      handleShiftTab(draftValue ?? '');
    },
    focusId: instanceId,
    dependencies: [handleShiftTab, draftValue],
  });

  const showEditingButton = !fieldDefinition.metadata.isUIReadOnly;

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
            transparentBackground
            options={{
              lineNumbers: 'off',
              folding: false,
              overviewRulerBorder: false,
              lineDecorationsWidth: 0,
              scrollbar: {
                useShadows: false,
                vertical: 'hidden',
                horizontal: 'hidden',
              },
            }}
            onChange={handleChange}
          />
        </StyledCodeEditorContainer>
      ) : (
        <>
          {showEditingButton && (
            <StyledSwitchModeButtonContainer>
              <FloatingIconButton
                Icon={IconPencil}
                onClick={handleStartEditing}
              />
            </StyledSwitchModeButtonContainer>
          )}

          <StyledJsonTreeContainer>
            <JsonTree
              value={precomputedDraftValue}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              shouldExpandNodeInitially={isTwoFirstDepths}
              onNodeValueClick={copyToClipboard}
            />
          </StyledJsonTreeContainer>
        </>
      )}
    </StyledContainer>
  );
};
