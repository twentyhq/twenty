import { createState } from 'twenty-ui/utilities';

type DraggedArea = {
  x: number;
  y: number;
  w: number;
  h: number;
} | null;

export const pageLayoutDraggedAreaState = createState<DraggedArea>({
  key: 'pageLayoutDraggedAreaState',
  defaultValue: null,
});
