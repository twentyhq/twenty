import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';
import { applySyntheticEventCompatibility } from '@/polyfills/events/utils/applySyntheticEventCompatibility';
import { markEventAsHostOriginated } from '@/polyfills/events/utils/markEventAsHostOriginated';
import { resolveEventClassForEventType } from '@/polyfills/events/utils/resolveEventClassForEventType';
import { applySerializedEventProperties } from '@/remote/elements/utils/applySerializedEventProperties';
import { type SerializedEventData } from '@/types/SerializedEventData';

type CreateWorkerEventFromSerializedEventInput = {
  target: Element;
  eventType: string;
  eventData: SerializedEventData;
};

export const createWorkerEventFromSerializedEvent = ({
  target,
  eventType,
  eventData,
}: CreateWorkerEventFromSerializedEventInput): Event => {
  const eventClass = resolveEventClassForEventType({
    eventType,
    eventClassScope: resolveOwnerWindowOfNode(target),
  });
  const event = new eventClass(eventType, { bubbles: false, cancelable: true });

  applySerializedEventProperties(event, eventData);
  markEventAsHostOriginated(event);

  return applySyntheticEventCompatibility(event);
};
