import { PointerActivationConstraints } from '@dnd-kit/dom';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';

import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

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
