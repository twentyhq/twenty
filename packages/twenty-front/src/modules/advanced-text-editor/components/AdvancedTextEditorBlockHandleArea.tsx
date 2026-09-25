import { AdvancedTextEditorBlockDragOverlay } from '@/advanced-text-editor/components/AdvancedTextEditorBlockDragOverlay';
import { AdvancedTextEditorBlockHandleMenu } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandleMenu';
import { useAdvancedTextEditorBlockDrag } from '@/advanced-text-editor/hooks/useAdvancedTextEditorBlockDrag';
import { getAdvancedTextEditorHoveredBlock } from '@/advanced-text-editor/utils/getAdvancedTextEditorHoveredBlock';
import { getAdvancedTextEditorNodeDisplay } from '@/advanced-text-editor/utils/getAdvancedTextEditorNodeDisplay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const HANDLE_SIZE_PX = 24;
const HANDLE_GAP_PX = 4;
const OUTLINE_OFFSET_PX = 4;
const HOVER_VERTICAL_MARGIN_PX = 24;

const StyledHandleArea = styled.div`
  min-height: 100%;
  position: relative;
`;

const StyledBlockOutline = styled.div`
  border: 1px solid ${themeCssVariables.border.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  pointer-events: none;
  position: absolute;
`;

const StyledHandleContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${HANDLE_SIZE_PX}px;
  justify-content: center;
  position: absolute;
  width: ${HANDLE_SIZE_PX}px;
`;

type HoveredBlockPosition = {
  pos: number;
  top: number;
  left: number;
  width: number;
  height: number;
  handleTop: number;
};

const getFirstLineHeight = (element: HTMLElement, blockHeight: number) => {
  const textElement = element.matches('p, h1, h2, h3')
    ? element
    : element.querySelector<HTMLElement>('p, h1, h2, h3');

  if (!isDefined(textElement)) {
    return blockHeight;
  }

  const { lineHeight, fontSize } = getComputedStyle(textElement);
  const lineHeightPx = parseFloat(lineHeight);

  return Number.isFinite(lineHeightPx)
    ? lineHeightPx
    : parseFloat(fontSize) * 1.2;
};

type AdvancedTextEditorBlockHandleAreaProps = {
  editor: Editor;
  children: ReactNode;
  onOpenBlockSettings?: () => void;
};

export const AdvancedTextEditorBlockHandleArea = ({
  editor,
  children,
  onOpenBlockSettings,
}: AdvancedTextEditorBlockHandleAreaProps) => {
  const { i18n } = useLingui();
  const handleAreaRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlockPosition | null>(
    null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { draggedBlock, dropIndicatorRef, dragPreviewRef, startBlockDrag } =
    useAdvancedTextEditorBlockDrag({
      editor,
      onBlockDropped: () => setHoveredBlock(null),
    });

  const updateHoveredBlock = (pointer: {
    clientX: number;
    clientY: number;
  }) => {
    const handleArea = handleAreaRef.current;

    if (!isDefined(handleArea) || editor.isDestroyed) {
      return;
    }

    const editorRect = editor.view.dom.getBoundingClientRect();
    const isNearEditor =
      pointer.clientY >= editorRect.top - HOVER_VERTICAL_MARGIN_PX &&
      pointer.clientY <= editorRect.bottom + HOVER_VERTICAL_MARGIN_PX;
    const block = isNearEditor
      ? getAdvancedTextEditorHoveredBlock({ editor, ...pointer })
      : null;

    if (!isDefined(block)) {
      setHoveredBlock(null);
      return;
    }

    const handleAreaRect = handleArea.getBoundingClientRect();
    const top = block.rect.top - handleAreaRect.top;
    const firstLineHeight = Math.min(
      getFirstLineHeight(block.element, block.rect.height),
      block.rect.height,
    );

    setHoveredBlock((previousBlock) => {
      const nextBlock = {
        pos: block.pos,
        top,
        left: block.rect.left - handleAreaRect.left,
        width: block.rect.width,
        height: block.rect.height,
        handleTop: top + (firstLineHeight - HANDLE_SIZE_PX) / 2,
      };

      const isUnchanged =
        previousBlock?.pos === nextBlock.pos &&
        previousBlock.top === nextBlock.top &&
        previousBlock.left === nextBlock.left &&
        previousBlock.width === nextBlock.width &&
        previousBlock.height === nextBlock.height;

      return isUnchanged ? previousBlock : nextBlock;
    });
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isMenuOpen || isDefined(draggedBlock) || !editor.isEditable) {
      return;
    }

    updateHoveredBlock({ clientX: event.clientX, clientY: event.clientY });
  };

  const handleMouseLeave = () => {
    if (!isMenuOpen) {
      setHoveredBlock(null);
    }
  };

  const handleKeyDown = () => {
    if (!isMenuOpen) {
      setHoveredBlock(null);
    }
  };

  const handleHandlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDefined(hoveredBlock)) {
      return;
    }

    const node = editor.state.doc.nodeAt(hoveredBlock.pos);

    if (!isDefined(node)) {
      return;
    }

    const { title, icon } = getAdvancedTextEditorNodeDisplay(node);

    startBlockDrag(event, {
      Icon: icon,
      label: i18n._(title),
      content: node.toJSON(),
      sourceRange: {
        from: hoveredBlock.pos,
        to: hoveredBlock.pos + node.nodeSize,
      },
    });
  };

  const handleMenuOpenChange = (isOpen: boolean) => {
    setIsMenuOpen(isOpen);

    if (!isOpen) {
      setHoveredBlock(null);
    }
  };

  const isHandleVisible = isDefined(hoveredBlock) && !isDefined(draggedBlock);

  return (
    <StyledHandleArea
      ref={handleAreaRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {children}
      {isHandleVisible && (
        <>
          <StyledBlockOutline
            style={{
              top: hoveredBlock.top - OUTLINE_OFFSET_PX,
              left: hoveredBlock.left - OUTLINE_OFFSET_PX,
              width: hoveredBlock.width + OUTLINE_OFFSET_PX * 2,
              height: hoveredBlock.height + OUTLINE_OFFSET_PX * 2,
            }}
          />
          <StyledHandleContainer
            style={{
              top: hoveredBlock.handleTop,
              left:
                hoveredBlock.left -
                OUTLINE_OFFSET_PX -
                HANDLE_GAP_PX -
                HANDLE_SIZE_PX,
            }}
          >
            <AdvancedTextEditorBlockHandleMenu
              editor={editor}
              blockPos={hoveredBlock.pos}
              onPointerDown={handleHandlePointerDown}
              onOpenChange={handleMenuOpenChange}
              onOpenBlockSettings={onOpenBlockSettings}
            />
          </StyledHandleContainer>
        </>
      )}
      {isDefined(draggedBlock) && (
        <AdvancedTextEditorBlockDragOverlay
          draggedBlock={draggedBlock}
          dropIndicatorRef={dropIndicatorRef}
          dragPreviewRef={dragPreviewRef}
        />
      )}
    </StyledHandleArea>
  );
};
