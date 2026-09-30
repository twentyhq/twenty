import { AdvancedTextEditorBlockHandleMenu } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandleMenu';
import { AdvancedTextEditorDragPreview } from '@/advanced-text-editor/components/AdvancedTextEditorDragPreview';
import { getAdvancedTextEditorBlockDisplay } from '@/advanced-text-editor/utils/getAdvancedTextEditorBlockDisplay';
import { offset } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import {
  DragHandle,
  type DragHandleProps,
} from '@tiptap/extension-drag-handle-react';
import { type CSSProperties, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const DRAG_HANDLE_OPTIONS: Pick<
  DragHandleProps,
  'nested' | 'computePositionConfig'
> = {
  nested: {
    edgeDetection: 'none',
    rules: [
      {
        id: 'excludeColumn',
        evaluate: ({ node }) =>
          node.type.name === TIPTAP_NODE_TYPES.COLUMN ? 1000 : 0,
      },
    ],
  },
  computePositionConfig: { middleware: [offset(8)] },
};

const StyledHandleSlot = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledBlockOutline = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  outline: 1px solid ${themeCssVariables.border.color.blue};
  outline-offset: ${themeCssVariables.spacing[1]};
  pointer-events: none;
  position: absolute;
`;

type HoveredBlock = {
  pos: number;
  display: ReturnType<typeof getAdvancedTextEditorBlockDisplay>;
  outline: CSSProperties;
};

type AdvancedTextEditorBlockHandleProps = {
  editor: Editor;
  onOpenBlockSettings?: () => void;
};

export const AdvancedTextEditorBlockHandle = ({
  editor,
  onOpenBlockSettings,
}: AdvancedTextEditorBlockHandleProps) => {
  const { i18n } = useLingui();
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlock | null>(null);
  const outlineContainer = editor.view.dom.parentElement;

  const handleNodeChange = ({ pos }: { pos: number }) => {
    const blockElement = pos >= 0 ? editor.view.nodeDOM(pos) : null;

    if (
      !(blockElement instanceof HTMLElement) ||
      !isDefined(outlineContainer)
    ) {
      setHoveredBlock(null);
      return;
    }

    const blockRect = blockElement.getBoundingClientRect();
    const containerRect = outlineContainer.getBoundingClientRect();

    setHoveredBlock({
      pos,
      display: getAdvancedTextEditorBlockDisplay(editor.state.doc, pos),
      outline: {
        top: blockRect.top - containerRect.top,
        left: blockRect.left - containerRect.left,
        width: blockRect.width,
        height: blockRect.height,
      },
    });
  };

  const handleMenuOpenChange = (isOpen: boolean) =>
    editor.view.dispatch(editor.state.tr.setMeta('lockDragHandle', isOpen));

  const replaceDragImageAfterDragHandle = () =>
    document.addEventListener(
      'dragstart',
      (event) => {
        const dragPreview = dragPreviewRef.current;

        if (isDefined(dragPreview)) {
          event.dataTransfer?.setDragImage(
            dragPreview,
            0,
            dragPreview.offsetHeight / 2,
          );
        }
      },
      { once: true },
    );

  return (
    <>
      <DragHandle
        editor={editor}
        nested={DRAG_HANDLE_OPTIONS.nested}
        computePositionConfig={DRAG_HANDLE_OPTIONS.computePositionConfig}
        onNodeChange={handleNodeChange}
        onElementDragStart={replaceDragImageAfterDragHandle}
        onElementDragEnd={() => {
          editor.view.dragging = null;
          setHoveredBlock(null);
        }}
      >
        <StyledHandleSlot>
          {isDefined(hoveredBlock) && (
            <>
              <AdvancedTextEditorBlockHandleMenu
                editor={editor}
                blockPos={hoveredBlock.pos}
                onOpenChange={handleMenuOpenChange}
                onOpenBlockSettings={onOpenBlockSettings}
              />
              <AdvancedTextEditorDragPreview
                ref={dragPreviewRef}
                Icon={hoveredBlock.display.icon}
                label={i18n._(hoveredBlock.display.title)}
              />
            </>
          )}
        </StyledHandleSlot>
      </DragHandle>
      {isDefined(hoveredBlock) &&
        isDefined(outlineContainer) &&
        createPortal(
          <StyledBlockOutline style={hoveredBlock.outline} />,
          outlineContainer,
        )}
    </>
  );
};
