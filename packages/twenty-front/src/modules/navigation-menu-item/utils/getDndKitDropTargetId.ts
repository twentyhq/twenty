import { DND_KIT_DROP_TARGET_ID_SEPARATOR } from '@/navigation-menu-item/constants/DndKitDropTargetIdSeparator';

export const getDndKitDropTargetId = (
  droppableId: string,
  index: number,
): string => `${droppableId}${DND_KIT_DROP_TARGET_ID_SEPARATOR}${index}`;
