import { type Draggable } from '@dnd-kit/dom';
import { KeyboardSensor } from '@dnd-kit/react';

import { PointerSensorWithSourceGuard } from '@/ui/utilities/drag-and-drop/sensors/PointerSensorWithSourceGuard';
import { getDragActivationConstraints } from '@/ui/utilities/drag-and-drop/utils/getDragActivationConstraints';
import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

export const PAGE_LAYOUT_TAB_LIST_DROPDOWN_SENSORS = [
  {
    plugin: PointerSensorWithSourceGuard,
    options: {
      activationConstraints: getDragActivationConstraints,
      activatorElements: (source: Draggable) => [source.element ?? undefined],
      preventActivation: shouldPreventDragActivation,
    },
  },
  KeyboardSensor,
];
