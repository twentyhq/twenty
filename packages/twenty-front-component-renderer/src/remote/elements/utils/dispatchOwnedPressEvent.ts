import { isDefined } from 'twenty-shared/utils';

import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { createWorkerEventFromSerializedEvent } from '@/remote/elements/utils/createWorkerEventFromSerializedEvent';
import { dispatchAsCurrentWindowEvent } from '@/remote/elements/utils/dispatchAsCurrentWindowEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const dispatchOwnedPressEvent = ({
  documentTarget,
  eventData,
}: {
  documentTarget: Document;
  eventData: SerializedEventData;
}): void => {
  if (!isDefined(eventData.targetRemoteElementId)) {
    return;
  }

  const targetElement = findElementByRemoteId({
    rootNode: documentTarget.body,
    remoteElementId: eventData.targetRemoteElementId,
  });

  if (!isElementNode(targetElement)) {
    return;
  }

  dispatchAsCurrentWindowEvent({
    eventTarget: targetElement,
    event: createWorkerEventFromSerializedEvent({
      listeningElement: targetElement,
      eventType: eventData.type,
      eventData,
    }),
  });
};
