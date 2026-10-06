import { type NodeWithOwnerDocument } from '@/polyfills/dom/types/NodeWithOwnerDocument';
import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';
import { applySyntheticEventCompatibility } from '@/polyfills/events/utils/applySyntheticEventCompatibility';
import { resolveEventClassForEventType } from '@/polyfills/events/utils/resolveEventClassForEventType';

export const createClickEventForElement = (
  element: NodeWithOwnerDocument,
): Event => {
  const clickEventClass = resolveEventClassForEventType({
    eventType: 'click',
    eventClassScope: resolveOwnerWindowOfNode(element),
  });

  return applySyntheticEventCompatibility(
    new clickEventClass('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
};
