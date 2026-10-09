import { remoteId } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { isDispatchableEventTarget } from '@/polyfills/events/utils/isDispatchableEventTarget';

export const resolveHostEventDispatchTarget = ({
  listeningElement,
  targetRemoteElementId,
}: {
  listeningElement: Element;
  targetRemoteElementId: string | undefined;
}): EventTarget => {
  if (
    !isDefined(targetRemoteElementId) ||
    remoteId(listeningElement) === targetRemoteElementId
  ) {
    return listeningElement;
  }

  const targetElement = findElementByRemoteId({
    rootNode: listeningElement,
    remoteElementId: targetRemoteElementId,
  });

  return isDispatchableEventTarget(targetElement)
    ? targetElement
    : listeningElement;
};
