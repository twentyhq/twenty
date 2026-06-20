import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULTS } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStickyNoteDefaults';
import { useWorkflowDiagramStickyNotes } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramStickyNotes';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramStickyNoteNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NodeResizer } from '@xyflow/react';
import { useContext, useState } from 'react';
import { WORKFLOW_STICKY_NOTE_COLORS } from 'twenty-shared/workflow';
import { ColorSample } from 'twenty-ui/data-display';
import { IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStickyNoteContainer = styled.div<{
  background: string;
  borderColor: string;
  textColor: string;
}>`
  background: ${({ background }) => background};
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  box-sizing: border-box;
  color: ${({ textColor }) => textColor};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledContent = styled.div`
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledPlaceholder = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTextArea = styled.textarea`
  background: transparent;
  border: none;
  color: inherit;
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  padding: ${themeCssVariables.spacing[2]};
  resize: none;
  width: 100%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  left: 0;
  padding: ${themeCssVariables.spacing[1]};
  position: absolute;
  top: -40px;
`;

const StyledColorButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 0;
`;

export const WorkflowDiagramStickyNoteNode = ({
  id,
  data,
}: {
  id: string;
  data: WorkflowDiagramStickyNoteNodeData;
}) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const { updateStickyNote, removeStickyNote } =
    useWorkflowDiagramStickyNotes();

  const [workflowSelectedNode, setWorkflowSelectedNode] = useAtomComponentState(
    workflowSelectedNodeComponentState,
  );
  const selected = workflowSelectedNode === id;

  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(data.content);

  const background = theme.tag.background[data.color];
  const textColor = theme.tag.text[data.color];

  const handleContentBlur = () => {
    setIsEditing(false);

    if (draftContent !== data.content) {
      updateStickyNote(id, { content: draftContent });
    }
  };

  const handleStartEditing = () => {
    setDraftContent(data.content);
    setIsEditing(true);
  };

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULTS.minSize.width}
        minHeight={WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULTS.minSize.height}
        color={textColor}
        onResizeEnd={(_, params) =>
          updateStickyNote(id, {
            size: { width: params.width, height: params.height },
          })
        }
      />

      {selected && (
        <StyledToolbar className="nodrag">
          {WORKFLOW_STICKY_NOTE_COLORS.map((color) => (
            <StyledColorButton
              key={color}
              aria-label={color}
              onClick={() => updateStickyNote(id, { color })}
            >
              <ColorSample colorName={color} variant="default" />
            </StyledColorButton>
          ))}
          <LightIconButton
            Icon={IconTrash}
            onClick={() => removeStickyNote(id)}
          />
        </StyledToolbar>
      )}

      <StyledStickyNoteContainer
        background={background}
        borderColor={textColor}
        textColor={textColor}
        onClick={() => setWorkflowSelectedNode(id)}
        onDoubleClick={handleStartEditing}
      >
        {isEditing ? (
          <StyledTextArea
            className="nodrag nowheel"
            autoFocus
            value={draftContent}
            placeholder={t`Write a note...`}
            onChange={(event) => setDraftContent(event.target.value)}
            onBlur={handleContentBlur}
          />
        ) : data.content.length > 0 ? (
          <StyledContent className="nowheel">
            <LazyMarkdownRenderer text={data.content} />
          </StyledContent>
        ) : (
          <StyledPlaceholder>{t`Double-click to edit`}</StyledPlaceholder>
        )}
      </StyledStickyNoteContainer>
    </>
  );
};
