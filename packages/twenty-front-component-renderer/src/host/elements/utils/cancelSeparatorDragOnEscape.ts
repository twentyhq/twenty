import { isDefined } from 'twenty-shared/utils';

export const cancelSeparatorDragOnEscape = ({
  separator,
  pointerId,
  onCancel,
}: {
  separator: HTMLElement;
  pointerId: number;
  onCancel: () => void;
}) => {
  const ownerWindow = separator.ownerDocument.defaultView;

  if (!isDefined(ownerWindow)) {
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!separator.hasPointerCapture(pointerId)) {
      ownerWindow.removeEventListener('keydown', handleKeyDown, true);
      return;
    }

    if (event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    ownerWindow.removeEventListener('keydown', handleKeyDown, true);
    separator.releasePointerCapture(pointerId);
    onCancel();
  };

  ownerWindow.addEventListener('keydown', handleKeyDown, true);
  separator.addEventListener(
    'lostpointercapture',
    () => ownerWindow.removeEventListener('keydown', handleKeyDown, true),
    { once: true },
  );
};
