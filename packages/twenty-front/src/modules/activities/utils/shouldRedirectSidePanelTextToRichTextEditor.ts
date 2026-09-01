import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

export const shouldRedirectSidePanelTextToRichTextEditor = (
  keyboardEvent: KeyboardEvent,
) => {
  const target = keyboardEvent.target;

  const isEditableTarget =
    target instanceof HTMLElement &&
    target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
    ) !== null;

  return (
    !isEditableTarget &&
    !isNonTextWritingKey(keyboardEvent.key) &&
    !keyboardEvent.ctrlKey &&
    !keyboardEvent.metaKey
  );
};
