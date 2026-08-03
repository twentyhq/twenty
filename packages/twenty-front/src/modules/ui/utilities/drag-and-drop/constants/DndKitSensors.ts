import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';

import { getDragActivationConstraints } from '@/ui/utilities/drag-and-drop/utils/getDragActivationConstraints';
import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

export const DND_KIT_SENSORS = [
  PointerSensor.configure({
    activationConstraints: getDragActivationConstraints,
    preventActivation: shouldPreventDragActivation,
  }),
  KeyboardSensor,
];
