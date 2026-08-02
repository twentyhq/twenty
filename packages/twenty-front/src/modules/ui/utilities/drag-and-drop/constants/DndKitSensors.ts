import { PointerActivationConstraints } from '@dnd-kit/dom';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';

import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

// Mouse/pen drags start past 8px so clicks still register. Touch needs a 200ms
// press-and-hold instead, otherwise every scroll swipe would start a drag.
export const DND_KIT_SENSORS = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [
            new PointerActivationConstraints.Delay({
              value: 200,
              tolerance: 8,
            }),
          ]
        : [new PointerActivationConstraints.Distance({ value: 8 })],
    preventActivation: shouldPreventDragActivation,
  }),
  KeyboardSensor,
];
