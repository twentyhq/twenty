import { DND_KIT_ACCESSIBILITY_ATTRIBUTES } from '@/ui/utilities/drag-and-drop/constants/DndKitAccessibilityAttributes';
import { DND_KIT_ACCESSIBILITY_STATE_ATTRIBUTES } from '@/ui/utilities/drag-and-drop/constants/DndKitAccessibilityStateAttributes';

export const removeDndKitAccessibilityAttributes = ({
  element,
  ownAttributes,
}: {
  element: Element;
  ownAttributes: Set<string>;
}) => {
  for (const attribute of DND_KIT_ACCESSIBILITY_ATTRIBUTES) {
    if (ownAttributes.has(attribute)) {
      continue;
    }

    // A state the element renders itself since registration, like a tab
    // becoming aria-disabled, differs from the idle value dnd-kit leaves.
    if (
      DND_KIT_ACCESSIBILITY_STATE_ATTRIBUTES.includes(attribute) &&
      element.getAttribute(attribute) !== 'false'
    ) {
      continue;
    }

    element.removeAttribute(attribute);
  }
};
