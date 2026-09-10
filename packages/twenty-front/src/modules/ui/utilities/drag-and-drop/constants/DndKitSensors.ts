import { KeyboardSensor } from '@dnd-kit/react';

import { PointerSensorWithSourceGuard } from '@/ui/utilities/drag-and-drop/sensors/PointerSensorWithSourceGuard';
import { getDragActivationConstraints } from '@/ui/utilities/drag-and-drop/utils/getDragActivationConstraints';
import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

export const DND_KIT_SENSORS = [
  PointerSensorWithSourceGuard.configure({
    activationConstraints: getDragActivationConstraints,
    preventActivation: shouldPreventDragActivation,
  }),
  KeyboardSensor,
];
