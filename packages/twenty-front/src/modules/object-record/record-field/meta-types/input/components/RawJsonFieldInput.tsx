import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconPencil } from 'twenty-ui/display';
import { CodeEditor, FloatingIconButton } from 'twenty-ui/input';
import { JsonTree, isTwoFirstDepths } from 'twenty-ui/json-visualizer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
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
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const {
    draftValue,
    precomputedDraftValue,
    setDraftValue,
    persistJsonField,
    fieldDefinition,
  } = useJsonField();

  const hotkeyScope = DEFAULT_CELL_SCOPE.scope;

  const containerRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);

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

  // FIXME: This is temporary. We'll soon introduce a new display mode for all fields and we'll have to remove this code.
  const isWorkflowRunOutputField =
    fieldDefinition.metadata.objectMetadataNameSingular ===
      CoreObjectNameSingular.WorkflowRun &&
    fieldDefinition.metadata.fieldName === 'output';

  const showEditingButton = !isWorkflowRunOutputField;

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
