import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { type OutsidePressEventData } from '@/types/OutsidePressEventData';

export const dispatchOutsidePressEvent = ({
  documentTarget,
  eventData,
}: {
  documentTarget: Document;
  eventData: OutsidePressEventData;
}): void => {
  documentTarget.body.dispatchEvent(
    createWorkerEventFromSerializedEvent({
      listeningElement: documentTarget.body,
      eventType: eventData.type,
      eventData: { ...eventData, bubbles: true },
    }),
  );
};
