import { PointerActivationConstraints } from '@dnd-kit/dom';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';

import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

// Pointer drags only start past 8px so clicks on draggable items still register.
export const DND_KIT_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
    preventActivation: shouldPreventDragActivation,
  }),
  KeyboardSensor,
];
