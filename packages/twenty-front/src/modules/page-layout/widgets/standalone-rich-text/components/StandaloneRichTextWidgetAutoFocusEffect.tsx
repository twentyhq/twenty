import { type Editor } from '@tiptap/core';
import { useEffect } from 'react';

type StandaloneRichTextWidgetAutoFocusEffectProps = {
  shouldFocus: boolean;
  editor: Editor;
  containerElement?: HTMLElement | null;
};

export const StandaloneRichTextWidgetAutoFocusEffect = ({
  shouldFocus,
  editor,
  containerElement,
}: StandaloneRichTextWidgetAutoFocusEffectProps) => {
  useEffect(() => {
    if (shouldFocus) {
      const alreadyFocused =
        containerElement?.contains(document.activeElement) ?? false;

      if (!alreadyFocused) {
        const rafId = requestAnimationFrame(() => {
          editor.commands.focus();
        });

        return () => {
          cancelAnimationFrame(rafId);
        };
      }
    }
  }, [shouldFocus, editor, containerElement]);

  return null;
};
