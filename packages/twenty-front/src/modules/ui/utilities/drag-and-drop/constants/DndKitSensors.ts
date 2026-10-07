import { KeyboardSensor } from '@dnd-kit/react';

import { DND_KIT_POINTER_SENSOR_OPTIONS } from '@/ui/utilities/drag-and-drop/constants/DndKitPointerSensorOptions';
import { PointerSensorWithSourceGuard } from '@/ui/utilities/drag-and-drop/sensors/PointerSensorWithSourceGuard';

export const DND_KIT_SENSORS = [
  PointerSensorWithSourceGuard.configure(DND_KIT_POINTER_SENSOR_OPTIONS),
  KeyboardSensor,
];
