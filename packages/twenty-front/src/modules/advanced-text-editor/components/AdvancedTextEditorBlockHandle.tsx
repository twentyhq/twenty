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
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const OUTLINE_OFFSET_PX = 4;

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
  computePositionConfig: {
    placement: 'left-start',
    strategy: 'absolute',
    middleware: [offset(8)],
  },
};

const StyledHandleSlot = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledBlockOutline = styled.div`
  border: 1px solid ${themeCssVariables.border.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  pointer-events: none;
  position: absolute;
`;

type HoveredBlock = {
  pos: number;
  top: number;
  left: number;
  width: number;
  height: number;
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
      top: blockRect.top - containerRect.top - OUTLINE_OFFSET_PX,
      left: blockRect.left - containerRect.left - OUTLINE_OFFSET_PX,
      width: blockRect.width + OUTLINE_OFFSET_PX * 2,
      height: blockRect.height + OUTLINE_OFFSET_PX * 2,
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

  const hoveredBlockDisplay = isDefined(hoveredBlock)
    ? getAdvancedTextEditorBlockDisplay(editor.state.doc, hoveredBlock.pos)
    : null;

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
          {isDefined(hoveredBlock) && isDefined(hoveredBlockDisplay) && (
            <>
              <AdvancedTextEditorBlockHandleMenu
                editor={editor}
                blockPos={hoveredBlock.pos}
                onOpenChange={handleMenuOpenChange}
                onOpenBlockSettings={onOpenBlockSettings}
              />
              <AdvancedTextEditorDragPreview
                ref={dragPreviewRef}
                isInsertion={false}
                Icon={hoveredBlockDisplay.icon}
                label={i18n._(hoveredBlockDisplay.title)}
              />
            </>
          )}
        </StyledHandleSlot>
      </DragHandle>
      {isDefined(hoveredBlock) &&
        isDefined(outlineContainer) &&
        createPortal(
          <StyledBlockOutline
            style={{
              top: hoveredBlock.top,
              left: hoveredBlock.left,
              width: hoveredBlock.width,
              height: hoveredBlock.height,
            }}
          />,
          outlineContainer,
        )}
    </>
  );
};
