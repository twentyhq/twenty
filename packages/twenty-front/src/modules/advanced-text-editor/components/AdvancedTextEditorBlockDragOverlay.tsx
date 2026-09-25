import { type AdvancedTextEditorDraggedBlock } from '@/advanced-text-editor/types/AdvancedTextEditorDraggedBlock';
import { styled } from '@linaria/react';
import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledDragSurface = styled.div`
  cursor: grabbing;
  inset: 0;
  position: fixed;
  touch-action: none;
  user-select: none;
  z-index: ${themeCssVariables.lastLayerZIndex};
`;

const StyledDropIndicator = styled.div`
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.pill};
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  transition:
    opacity calc(${themeCssVariables.animation.duration.fast} * 1s) ease-out,
    transform calc(${themeCssVariables.animation.duration.fast} * 1s)
      cubic-bezier(0.2, 0, 0, 1),
    width calc(${themeCssVariables.animation.duration.fast} * 1s)
      cubic-bezier(0.2, 0, 0, 1);
  will-change: transform, opacity;

  &[data-visible='true'] {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
      ease-out;
  }
`;

const StyledDropBadge = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.rounded};
  display: inline-flex;
  flex: none;
  height: 16px;
  justify-content: center;
  opacity: 0;
  scale: 0.5;
  transition:
    opacity calc(${themeCssVariables.animation.duration.fast} * 1s) ease-out,
    scale calc(${themeCssVariables.animation.duration.fast} * 1s)
      cubic-bezier(0.2, 0, 0, 1);
  width: 16px;
`;

const StyledDragPreview = styled.div`
  @keyframes advancedTextEditorDragPreviewAppear {
    from {
      opacity: 0;
      scale: 0.9;
    }
  }

  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.strong};
  background-color: ${themeCssVariables.tooltip.background};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: ${themeCssVariables.tooltip.color};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  left: 0;
  opacity: 0.64;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]};
  pointer-events: none;
  position: fixed;
  top: 0;
  transform-origin: left center;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-out;
  translate: 0 -50%;
  visibility: hidden;
  white-space: nowrap;
  will-change: transform;

  &[data-positioned='true'] {
    animation: advancedTextEditorDragPreviewAppear
      calc(${themeCssVariables.animation.duration.fast} * 1s)
      cubic-bezier(0.2, 0, 0, 1);
    visibility: visible;
  }

  &[data-droppable='true'] {
    opacity: 1;
  }

  &[data-moving='true'] {
    padding-left: ${themeCssVariables.spacing[2]};
  }

  &[data-droppable='true'] ${StyledDropBadge} {
    opacity: 1;
    scale: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-positioned='true'] {
      animation: none;
    }
  }
`;

type AdvancedTextEditorBlockDragOverlayProps = {
  draggedBlock: AdvancedTextEditorDraggedBlock;
  dropIndicatorRef: RefObject<HTMLDivElement | null>;
  dragPreviewRef: RefObject<HTMLDivElement | null>;
};

export const AdvancedTextEditorBlockDragOverlay = ({
  draggedBlock: { Icon, label, sourceRange },
  dropIndicatorRef,
  dragPreviewRef,
}: AdvancedTextEditorBlockDragOverlayProps) => {
  const theme = useTheme();
  const isMovingExistingBlock = isDefined(sourceRange);

  return createPortal(
    <StyledDragSurface>
      <StyledDropIndicator ref={dropIndicatorRef} />
      <StyledDragPreview
        ref={dragPreviewRef}
        data-moving={String(isMovingExistingBlock)}
      >
        {!isMovingExistingBlock && (
          <StyledDropBadge>
            <IconPlus size={10} stroke={theme.icon.stroke.lg} />
          </StyledDropBadge>
        )}
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        {label}
      </StyledDragPreview>
    </StyledDragSurface>,
    document.body,
  );
};
