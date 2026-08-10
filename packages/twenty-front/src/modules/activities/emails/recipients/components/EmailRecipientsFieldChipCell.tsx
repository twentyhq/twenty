import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { EMAIL_RECIPIENT_DND_TYPE } from '@/activities/emails/recipients/constants/EmailRecipientDndType';
import { EmailRecipientsFieldChip } from '@/activities/emails/recipients/components/EmailRecipientsFieldChip';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';

export type EmailRecipientChipDropEdge = 'before' | 'after' | null;

const DROP_INDICATOR_WIDTH = '2px';
// Centers the bar in the 4px chip gap: half the gap plus half the bar.
const DROP_INDICATOR_OFFSET = '-3px';

// The insertion bar is absolutely positioned so showing it never reflows the
// wrapping chip row mid-drag.
const StyledChipDropZone = styled.div`
  position: relative;

  &::before,
  &::after {
    background-color: ${themeCssVariables.color.blue};
    border-radius: ${themeCssVariables.border.radius.sm};
    bottom: 0;
    content: '';
    opacity: 0;
    position: absolute;
    top: 0;
    transition: opacity 120ms ease-out;
    width: ${DROP_INDICATOR_WIDTH};
  }

  &::before {
    left: ${DROP_INDICATOR_OFFSET};
  }

  &::after {
    right: ${DROP_INDICATOR_OFFSET};
  }

  &[data-drop-edge='before']::before,
  &[data-drop-edge='after']::after {
    opacity: 1;
  }
`;

type EmailRecipientsFieldChipCellProps = {
  chipId: string;
  chipIndex: number;
  dropdownId: string;
  dropEdge: EmailRecipientChipDropEdge;
  fieldId: EmailRecipientsFieldId;
  isFlashing: boolean;
  isInvalid: boolean;
  isSelected: boolean;
  onEdit: () => void;
  onExtendSelectionTo: () => void;
  onRemove: () => void;
  onToggleSelection: () => void;
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  selectedIndices: number[];
  sortableId: string;
};

export const EmailRecipientsFieldChipCell = ({
  chipId,
  chipIndex,
  dropdownId,
  dropEdge,
  fieldId,
  isFlashing,
  isInvalid,
  isSelected,
  onEdit,
  onExtendSelectionTo,
  onRemove,
  onToggleSelection,
  recipient,
  resolution,
  selectedIndices,
  sortableId,
}: EmailRecipientsFieldChipCellProps) => {
  const dragData: EmailRecipientDragData = {
    fieldId,
    index: chipIndex,
    selectedIndices,
  };

  // Intercepting in the capture phase keeps a modified click from reaching the
  // chip's dropdown, so shift/cmd click selects instead of opening the menu.
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      onExtendSelectionTo();
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      onToggleSelection();
    }
  };

  return (
    <DragDropItemSortableCell
      accept={EMAIL_RECIPIENT_DND_TYPE}
      data={dragData}
      group={fieldId}
      id={sortableId}
      index={chipIndex}
      orientation="vertical"
      type={EMAIL_RECIPIENT_DND_TYPE}
    >
      <StyledChipDropZone
        data-drop-edge={dropEdge ?? undefined}
        onClickCapture={handleClickCapture}
        // Keeps focus in the text input so chip keyboard navigation survives a
        // click on a chip.
        onMouseDown={(event) => event.preventDefault()}
      >
        <EmailRecipientsFieldChip
          chipId={chipId}
          dropdownId={dropdownId}
          recipient={recipient}
          resolution={resolution}
          isInvalid={isInvalid}
          selected={isSelected}
          isFlashing={isFlashing}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </StyledChipDropZone>
    </DragDropItemSortableCell>
  );
};
