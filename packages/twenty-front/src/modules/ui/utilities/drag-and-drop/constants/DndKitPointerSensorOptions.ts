import { type PointerSensorOptions } from '@dnd-kit/dom';

import { getDragActivationConstraints } from '@/ui/utilities/drag-and-drop/utils/getDragActivationConstraints';
import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

export const DND_KIT_POINTER_SENSOR_OPTIONS: PointerSensorOptions = {
  activationConstraints: getDragActivationConstraints,
  preventActivation: shouldPreventDragActivation,
};
