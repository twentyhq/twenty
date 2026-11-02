import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { dispatchAsCurrentWindowEvent } from '@/remote/elements/utils/dispatchAsCurrentWindowEvent';
import { type OutsidePressEventData } from '@/types/OutsidePressEventData';

export const dispatchOutsidePressEvent = ({
  documentTarget,
  eventData,
}: {
  documentTarget: Document;
  eventData: OutsidePressEventData;
}): void => {
  dispatchAsCurrentWindowEvent({
    eventTarget: documentTarget.body,
    event: createWorkerEventFromSerializedEvent({
      listeningElement: documentTarget.body,
      eventType: eventData.type,
      eventData: { ...eventData, bubbles: true },
    }),
  });
};
