import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENTS_FIELD_IDS } from '@/activities/emails/recipients/constants/EmailRecipientsFieldIds';
import { type DraggedEmailRecipients } from '@/activities/emails/recipients/types/DraggedEmailRecipients';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';
import { type EmailRecipientsByFieldIdUpdater } from '@/activities/emails/recipients/types/EmailRecipientsByFieldIdUpdater';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { moveEmailRecipientsBetweenFields } from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
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
    update: EmailRecipientsByFieldIdUpdater,
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
  const [draggedRecipients, setDraggedRecipients] =
    useState<DraggedEmailRecipients | null>(null);

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
      // Chips flow horizontally, so the insertion seam is vertical.
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
    const destinationFieldId = resolvedDrop.droppableId;

    onRecipientsByFieldIdChange((currentRecipientsByFieldId) =>
      moveEmailRecipientsBetweenFields({
        recipientsByFieldId: currentRecipientsByFieldId,
        sourceFieldId: sourceData.fieldId,
        movedIndices,
        destinationFieldId,
        destinationIndex: resolvedDrop.dropTargetIndex,
      }),
    );
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
