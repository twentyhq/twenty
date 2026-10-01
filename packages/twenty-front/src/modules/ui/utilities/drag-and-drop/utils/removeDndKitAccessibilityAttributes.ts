import { DND_KIT_ACCESSIBILITY_ATTRIBUTES } from '@/ui/utilities/drag-and-drop/constants/DndKitAccessibilityAttributes';

export const removeDndKitAccessibilityAttributes = (element: Element) => {
  for (const attribute of DND_KIT_ACCESSIBILITY_ATTRIBUTES) {
    element.removeAttribute(attribute);
  }
};
