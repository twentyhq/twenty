import { DND_KIT_ACCESSIBILITY_ATTRIBUTES } from '@/ui/utilities/drag-and-drop/constants/DndKitAccessibilityAttributes';

export const getOwnDndKitAccessibilityAttributes = (element: Element) =>
  new Set(
    DND_KIT_ACCESSIBILITY_ATTRIBUTES.filter((attribute) =>
      element.hasAttribute(attribute),
    ),
  );
