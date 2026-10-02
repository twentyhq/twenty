import { isDefined } from 'twenty-shared/utils';

import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { isDispatchableEventTarget } from '@/polyfills/events/utils/isDispatchableEventTarget';

export const resolveHostEventRelatedTarget = ({
  listeningElement,
  relatedTargetRemoteElementId,
}: {
  listeningElement: Element;
  relatedTargetRemoteElementId: string | undefined;
}): EventTarget | undefined => {
  if (!isDefined(relatedTargetRemoteElementId)) {
    return undefined;
  }

  const relatedTargetElement = findElementByRemoteId({
    rootNode: listeningElement.ownerDocument,
    remoteElementId: relatedTargetRemoteElementId,
  });

  return isDispatchableEventTarget(relatedTargetElement)
    ? relatedTargetElement
    : undefined;
};
