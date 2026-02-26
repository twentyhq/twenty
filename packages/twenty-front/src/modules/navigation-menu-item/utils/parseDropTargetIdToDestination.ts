import { DND_KIT_DROP_TARGET_ID_SEPARATOR } from '@/navigation-menu-item/constants/DndKitDropTargetIdSeparator';

export const parseDropTargetIdToDestination = (
  dropTargetId: string,
): { droppableId: string; index: number } | null => {
  const idx = dropTargetId.indexOf(DND_KIT_DROP_TARGET_ID_SEPARATOR);
  if (idx === -1) {
    return null;
  }
  const droppableId = dropTargetId.slice(0, idx);
  const index = parseInt(
    dropTargetId.slice(idx + DND_KIT_DROP_TARGET_ID_SEPARATOR.length),
    10,
  );
  if (Number.isNaN(index) || index < 0) {
    return null;
  }
  return { droppableId, index };
};
