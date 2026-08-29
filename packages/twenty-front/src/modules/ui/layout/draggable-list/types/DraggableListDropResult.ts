export type DraggableListDropResult = {
  draggableId: string;
  source: { index: number };
  destination: { index: number } | null;
};
