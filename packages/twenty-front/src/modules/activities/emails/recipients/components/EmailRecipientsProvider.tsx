import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { EmailRecipientsContextProvider } from '@/activities/emails/recipients/contexts/EmailRecipientsContext';
import { useEmailRecipientsDragAndDrop } from '@/activities/emails/recipients/hooks/useEmailRecipientsDragAndDrop';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';
import { type EmailRecipientsByFieldIdUpdater } from '@/activities/emails/recipients/types/EmailRecipientsByFieldIdUpdater';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';

type EmailRecipientsProviderProps = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  onChange: (update: EmailRecipientsByFieldIdUpdater) => void;
  children: ReactNode;
};

export const EmailRecipientsProvider = ({
  recipientsByFieldId,
  onChange,
  children,
}: EmailRecipientsProviderProps) => {
  const { contextValues, draggedRecipients, handlers } =
    useEmailRecipientsDragAndDrop({
      recipientsByFieldId,
      onRecipientsByFieldIdChange: onChange,
    });

  return (
    <EmailRecipientsContextProvider
      value={{
        recipientsByFieldId,
        draggedRecipients,
        setFieldRecipients: ({ fieldId, recipients }) =>
          onChange((currentRecipientsByFieldId) => ({
            ...currentRecipientsByFieldId,
            [fieldId]: recipients,
          })),
      }}
    >
      <DragDropItemDndContext.Provider value={contextValues}>
        <DragDropProvider<EmailRecipientDragData>
          sensors={DND_KIT_SENSORS}
          plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          {children}
        </DragDropProvider>
      </DragDropItemDndContext.Provider>
    </EmailRecipientsContextProvider>
  );
};
