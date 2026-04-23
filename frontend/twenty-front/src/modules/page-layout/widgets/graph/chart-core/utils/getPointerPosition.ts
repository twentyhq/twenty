export const getPointerPosition = ({
  event,
  element,
}: {
  event: { clientX: number; clientY: number };
  element: HTMLElement;
}): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};
