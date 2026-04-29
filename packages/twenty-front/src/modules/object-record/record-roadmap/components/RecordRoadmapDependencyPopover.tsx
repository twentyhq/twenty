import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { IconTrash } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type RoadmapDependency } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDependencies';

const POPOVER_WIDTH_PX = 240;

// Floating card anchored at the clicked arrow's elbow. Renders inside
// `<StyledTimelineInner>` so its absolute coordinates already match the
// inner-canvas coordinate system used by `barLayouts`.
const StyledPopover = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  position: absolute;
  width: ${POPOVER_WIDTH_PX}px;
  z-index: 5;
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledTextarea = styled.textarea`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 4px;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 56px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;

  &:focus {
    border-color: ${themeCssVariables.border.color.medium};
    outline: none;
  }
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledDeleteButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${themeCssVariables.border.color.danger};
  border-radius: 4px;
  color: ${themeCssVariables.font.color.danger};
  cursor: pointer;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${themeCssVariables.tag.background.red};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

type RecordRoadmapDependencyPopoverProps = {
  dependency: RoadmapDependency;
  anchorXPx: number;
  anchorYPx: number;
  /** Width of the inner canvas so we can clamp the popover when the
      anchor is near the right edge. */
  canvasWidthPx: number;
  onClose: () => void;
  onDelete: () => Promise<void> | void;
  onDescriptionSave: (description: string | null) => Promise<void> | void;
};

// Anchored card the user opens by clicking a dependency arrow. Edits
// the description inline (saves on blur if changed) and surfaces a
// delete button. Closes on outside click, ESC, or after a delete. The
// description input doesn't auto-save on every keystroke — flushing
// on blur keeps GraphQL traffic predictable while still feeling live.
export const RecordRoadmapDependencyPopover = ({
  dependency,
  anchorXPx,
  anchorYPx,
  canvasWidthPx,
  onClose,
  onDelete,
  onDescriptionSave,
}: RecordRoadmapDependencyPopoverProps) => {
  const [description, setDescription] = useState<string>(
    dependency.description ?? '',
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside the popover. Listens at capture phase so the
  // dismissal happens before any underlying click handler (e.g. opening
  // a different dependency) so the new selection takes effect cleanly.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        popoverRef.current !== null &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    window.addEventListener('pointerdown', handlePointerDown, true);
    return () =>
      window.removeEventListener('pointerdown', handlePointerDown, true);
  }, [onClose]);

  // ESC closes — pairs with the connection-mode ESC handler in
  // RecordRoadmapTimeline so the user has one canonical "cancel" key
  // for any roadmap-edit dialog.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Clamp horizontal position so the popover doesn't get clipped at the
  // right edge of the canvas. 8px breathing room from each edge.
  const clampedLeftPx = Math.max(
    8,
    Math.min(canvasWidthPx - POPOVER_WIDTH_PX - 8, anchorXPx + 12),
  );

  return (
    <StyledPopover
      ref={popoverRef}
      style={{ left: clampedLeftPx, top: anchorYPx + 8 }}
    >
      <StyledHeader>Dependency</StyledHeader>
      <StyledLabel>Description</StyledLabel>
      <StyledTextarea
        value={description}
        placeholder="Why does this milestone depend on the other one?"
        onChange={(event) => setDescription(event.target.value)}
        onBlur={() => {
          // Only fire the mutation when the value actually changed —
          // skips a round-trip when the user just opened the popover
          // and clicked elsewhere.
          const next = description.trim().length === 0 ? null : description;
          if ((dependency.description ?? null) !== next) {
            void onDescriptionSave(next);
          }
        }}
      />
      <StyledFooter>
        <StyledDeleteButton
          type="button"
          disabled={isDeleting}
          onClick={async () => {
            setIsDeleting(true);
            try {
              await onDelete();
            } finally {
              setIsDeleting(false);
            }
          }}
        >
          <IconTrash size={14} />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </StyledDeleteButton>
      </StyledFooter>
    </StyledPopover>
  );
};
