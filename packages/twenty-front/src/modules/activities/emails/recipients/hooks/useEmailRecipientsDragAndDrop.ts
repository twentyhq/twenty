import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENTS_FIELD_IDS } from '@/activities/emails/recipients/constants/EmailRecipientsFieldIds';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import {
  type EmailRecipientsByFieldId,
  moveEmailRecipientsBetweenFields,
} from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
import { type DragDropItemDndContextValue } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';

type DragStartEvent = DragDropProviderDragStartEvent<EmailRecipientDragData>;
type DragMoveEvent = DragDropProviderDragMoveEvent<EmailRecipientDragData>;
type DragEndEvent = DragDropProviderDragEndEvent<EmailRecipientDragData>;

type UseEmailRecipientsDragAndDropArgs = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  onRecipientsByFieldIdChange: (
    recipientsByFieldId: EmailRecipientsByFieldId,
  ) => void;
};

const isEmailRecipientsFieldId = (
  value: string,
): value is EmailRecipientsFieldId =>
  EMAIL_RECIPIENTS_FIELD_IDS.some((fieldId) => fieldId === value);

export const useEmailRecipientsDragAndDrop = ({
  recipientsByFieldId,
  onRecipientsByFieldIdChange,
}: UseEmailRecipientsDragAndDropArgs) => {
  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );
  const [draggedRecipients, setDraggedRecipients] = useState<{
    fieldId: EmailRecipientsFieldId;
    indices: number[];
  } | null>(null);

  const getDroppableItemCount = (droppableId: string) =>
    isEmailRecipientsFieldId(droppableId)
      ? recipientsByFieldId[droppableId].length
      : 0;

  const clearActiveDropTarget = () => {
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  };

  const getMovedIndices = (sourceData: EmailRecipientDragData): number[] =>
    sourceData.selectedIndices.includes(sourceData.index)
      ? sourceData.selectedIndices
      : [sourceData.index];

  const onDragStart = (event: DragStartEvent) => {
    clearActiveDropTarget();

    const sourceData = event.operation.source?.data as
      | EmailRecipientDragData
      | undefined;

    setDraggedRecipients(
      isDefined(sourceData)
        ? {
            fieldId: sourceData.fieldId,
            indices: getMovedIndices(sourceData),
          }
        : null,
    );
  };

  const onDragMove = (event: DragMoveEvent) => {
    const resolvedDrop = resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      // Chips flow horizontally, so the insertion boundary is a vertical seam
      // and the pointer's x position decides which side of a chip it lands on.
      defaultOrientation: 'vertical',
      getDroppableItemCount,
    });

    setActiveDropTargetIndex(resolvedDrop?.dropTargetIndex ?? null);
    setActiveDroppableId(resolvedDrop?.droppableId ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    clearActiveDropTarget();
    setDraggedRecipients(null);

    const sourceData = event.operation.source?.data as
      | EmailRecipientDragData
      | undefined;

    if (event.canceled || !isDefined(sourceData)) {
      return;
    }

    const resolvedDrop = resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: 'vertical',
      getDroppableItemCount,
    });

    if (
      !isDefined(resolvedDrop) ||
      !isEmailRecipientsFieldId(resolvedDrop.droppableId)
    ) {
      return;
    }

    const movedIndices = getMovedIndices(sourceData);

    const nextRecipientsByFieldId = moveEmailRecipientsBetweenFields({
      recipientsByFieldId,
      sourceFieldId: sourceData.fieldId,
      movedIndices,
      destinationFieldId: resolvedDrop.droppableId,
      destinationIndex: resolvedDrop.dropTargetIndex,
    });

    onRecipientsByFieldIdChange(nextRecipientsByFieldId);
  };

  const contextValues: DragDropItemDndContextValue = {
    activeDropTargetIndex,
    activeDroppableId,
  };

  return {
    contextValues,
    draggedRecipients,
    handlers: { onDragStart, onDragMove, onDragEnd },
  };
};
