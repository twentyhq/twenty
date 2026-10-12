import { DragDropProvider } from '@dnd-kit/react';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { useEmailRecipientsDragAndDrop } from '@/activities/emails/recipients/hooks/useEmailRecipientsDragAndDrop';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';

type StatefulEmailRecipientsFieldInputProps = {
  initialRecipients?: EmailRecipient[];
  onSubmit: () => void;
};

export const StatefulEmailRecipientsFieldInput = ({
  initialRecipients = [],
  onSubmit,
}: StatefulEmailRecipientsFieldInputProps) => {
  const [recipientsByFieldId, setRecipientsByFieldId] =
    useState<EmailRecipientsByFieldId>({
      to: initialRecipients,
      cc: [],
      bcc: [],
    });
  const { contextValues, draggedRecipients, handlers } =
    useEmailRecipientsDragAndDrop({
      recipientsByFieldId,
      onRecipientsByFieldIdChange: setRecipientsByFieldId,
    });
  const excludedSuggestionKeys = Object.values(recipientsByFieldId)
    .flat()
    .map((recipient) => getEmailRecipientKey(recipient.address));

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<EmailRecipientDragData>
        sensors={DND_KIT_SENSORS}
        plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {(['to', 'cc'] as const).map((fieldId) => (
          <div key={fieldId} role="group" aria-label={`${fieldId} recipients`}>
            <ComposerFieldRow label={fieldId === 'to' ? 'To' : 'Cc'}>
              <EmailRecipientsFieldInput
                fieldId={fieldId}
                label={fieldId === 'to' ? 'To' : 'Cc'}
                draggedSourceIndices={
                  draggedRecipients?.fieldId === fieldId
                    ? draggedRecipients.indices
                    : null
                }
                recipients={recipientsByFieldId[fieldId]}
                onChange={(recipients) =>
                  setRecipientsByFieldId((currentRecipientsByFieldId) => ({
                    ...currentRecipientsByFieldId,
                    [fieldId]: recipients,
                  }))
                }
                onSubmit={onSubmit}
                excludedSuggestionKeys={excludedSuggestionKeys}
              />
            </ComposerFieldRow>
          </div>
        ))}
        <Button onClick={onSubmit}>Send</Button>
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
