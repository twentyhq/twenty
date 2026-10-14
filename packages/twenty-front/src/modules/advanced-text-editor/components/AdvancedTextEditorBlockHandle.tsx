import { AdvancedTextEditorBlockHandleMenu } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandleMenu';
import { AdvancedTextEditorDragPreview } from '@/advanced-text-editor/components/AdvancedTextEditorDragPreview';
import { getAdvancedTextEditorBlockDisplay } from '@/advanced-text-editor/utils/getAdvancedTextEditorBlockDisplay';
import { getBlockHandleAnchorRect } from '@/advanced-text-editor/utils/getBlockHandleAnchorRect';
import { offset } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import {
  DragHandle,
  type DragHandleProps,
} from '@tiptap/extension-drag-handle-react';
import { useRef, useState } from 'react';
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
        id: 'excludeColumnAndItsContent',
        evaluate: ({ node, $pos, depth }) =>
          node.type.name === TIPTAP_NODE_TYPES.COLUMN ||
          Array.from({ length: depth }, (_, ancestorDepth) =>
            $pos.node(ancestorDepth),
          ).some((ancestor) => ancestor.type.name === TIPTAP_NODE_TYPES.COLUMN)
            ? 1000
            : 0,
      },
    ],
  },
  computePositionConfig: { placement: 'left', middleware: [offset(4)] },
};

const StyledHandleSlot = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

type HoveredBlock = {
  pos: number;
  display: ReturnType<typeof getAdvancedTextEditorBlockDisplay>;
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
  const handleSlotRef = useRef<HTMLDivElement>(null);
  const hoveredBlockElementRef = useRef<HTMLElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlock | null>(null);

  const getHoveredBlockAnchor = () => {
    const blockElement = hoveredBlockElementRef.current;

    if (!isDefined(blockElement)) {
      return null;
    }

    return {
      getBoundingClientRect: () =>
        getBlockHandleAnchorRect({
          blockElement,
          handleHeight: handleSlotRef.current?.offsetHeight ?? 0,
        }),
    };
  };

  const handleNodeChange = ({ pos }: { pos: number }) => {
    const blockElement = pos >= 0 ? editor.view.nodeDOM(pos) : null;

    hoveredBlockElementRef.current =
      blockElement instanceof HTMLElement ? blockElement : null;

    setHoveredBlock(
      blockElement instanceof HTMLElement
        ? {
            pos,
            display: getAdvancedTextEditorBlockDisplay(editor.state.doc, pos),
          }
        : null,
    );
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
    <DragHandle
      editor={editor}
      nested={DRAG_HANDLE_OPTIONS.nested}
      computePositionConfig={DRAG_HANDLE_OPTIONS.computePositionConfig}
      getReferencedVirtualElement={getHoveredBlockAnchor}
      onNodeChange={handleNodeChange}
      onElementDragStart={replaceDragImageAfterDragHandle}
      onElementDragEnd={() => {
        editor.view.dragging = null;
        editor.view.dispatch(editor.state.tr.setMeta('hideDragHandle', true));
        setHoveredBlock(null);
      }}
    >
      <StyledHandleSlot ref={handleSlotRef}>
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
  );
};
