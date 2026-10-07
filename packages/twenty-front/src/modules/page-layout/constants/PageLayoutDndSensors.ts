import { KeyboardSensor } from '@dnd-kit/react';

import { getPageLayoutDragActivatorElements } from '@/page-layout/utils/getPageLayoutDragActivatorElements';
import { DND_KIT_POINTER_SENSOR_OPTIONS } from '@/ui/utilities/drag-and-drop/constants/DndKitPointerSensorOptions';
import { PointerSensorWithSourceGuard } from '@/ui/utilities/drag-and-drop/sensors/PointerSensorWithSourceGuard';

export const PAGE_LAYOUT_DND_SENSORS = [
  PointerSensorWithSourceGuard.configure({
    ...DND_KIT_POINTER_SENSOR_OPTIONS,
    activatorElements: getPageLayoutDragActivatorElements,
  }),
  KeyboardSensor,
];
