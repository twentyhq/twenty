import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

export const createInputSelectionListenerRef = ({
  onSelectionChange,
}: {
  onSelectionChange: () => void;
}): ElementRefCallback => {
  let attachedElement: Element | null = null;

  const handleDocumentSelectionChange = (event: Event) => {
    if (!isDefined(attachedElement)) {
      return;
    }

    const { ownerDocument } = attachedElement;
    const isBubbledElementSelectionChange = event.target !== ownerDocument;
    const isAttachedElementFocused =
      ownerDocument.activeElement === attachedElement;

    if (isBubbledElementSelectionChange || !isAttachedElementFocused) {
      return;
    }

    onSelectionChange();
  };

  return (element: Element | null) => {
    if (isDefined(attachedElement)) {
      attachedElement.removeEventListener('selectionchange', onSelectionChange);
      attachedElement.ownerDocument.removeEventListener(
        'selectionchange',
        handleDocumentSelectionChange,
      );
    }

    attachedElement = element;

    if (!isDefined(element)) {
      return;
    }

    element.addEventListener('selectionchange', onSelectionChange);
    element.ownerDocument.addEventListener(
      'selectionchange',
      handleDocumentSelectionChange,
    );
  };
};
