export type PointerEventListener = ({
  x,
  y,
  event,
}: {
  x: number;
  y: number;
  event: MouseEvent | TouchEvent;
}) => void;
