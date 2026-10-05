import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';
import { applySyntheticEventCompatibility } from '@/polyfills/events/utils/applySyntheticEventCompatibility';
import { markEventAsHostOriginated } from '@/polyfills/events/utils/markEventAsHostOriginated';
import { resolveEventClassForEventType } from '@/polyfills/events/utils/resolveEventClassForEventType';
import { setHostEventDispatchTarget } from '@/polyfills/events/utils/setHostEventDispatchTarget';
import { applySerializedEventProperties } from '@/remote/elements/utils/applySerializedEventProperties';
import { applySerializedEventRelatedTarget } from '@/remote/elements/utils/applySerializedEventRelatedTarget';
import { applySerializedEventTargetProperties } from '@/remote/elements/utils/applySerializedEventTargetProperties';
import { resolveHostEventDispatchTarget } from '@/remote/elements/utils/resolveHostEventDispatchTarget';
import { resolveHostEventRelatedTarget } from '@/remote/elements/utils/resolveHostEventRelatedTarget';
import { type SerializedEventData } from '@/types/SerializedEventData';

type CreateWorkerEventFromSerializedEventInput = {
  listeningElement: Element;
  eventType: string;
  eventData: SerializedEventData;
};

export const createWorkerEventFromSerializedEvent = ({
  listeningElement,
  eventType,
  eventData,
}: CreateWorkerEventFromSerializedEventInput): Event => {
  const dispatchTarget = resolveHostEventDispatchTarget({
    listeningElement,
    targetRemoteElementId: eventData.targetRemoteElementId,
  });

  applySerializedEventTargetProperties({ element: dispatchTarget, eventData });

  const eventClass = resolveEventClassForEventType({
    eventType,
    eventClassScope: resolveOwnerWindowOfNode(listeningElement),
  });
  const event = new eventClass(eventType, {
    bubbles: eventData.bubbles === true,
    cancelable: true,
  });

  applySerializedEventProperties({ event, eventData });
  applySerializedEventRelatedTarget({
    event,
    relatedTarget: resolveHostEventRelatedTarget({
      listeningElement,
      relatedTargetRemoteElementId: eventData.relatedTargetRemoteElementId,
    }),
  });
  markEventAsHostOriginated(event);
  setHostEventDispatchTarget({ event, dispatchTarget });

  return applySyntheticEventCompatibility(event);
};
