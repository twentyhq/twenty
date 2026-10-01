export const isClickFromPointerDown = ({
  clickTarget,
  pointerDownTarget,
}: {
  clickTarget: EventTarget | null;
  pointerDownTarget: EventTarget | null;
}) => {
  if (!(clickTarget instanceof Node) || !(pointerDownTarget instanceof Node)) {
    return false;
  }

  return (
    !pointerDownTarget.isConnected || clickTarget.contains(pointerDownTarget)
  );
};
