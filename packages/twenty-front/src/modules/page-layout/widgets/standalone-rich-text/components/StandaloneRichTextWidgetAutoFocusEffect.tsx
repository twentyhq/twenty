import { type DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';
import { useEffect } from 'react';

type StandaloneRichTextWidgetAutoFocusEffectProps = {
  shouldFocus: boolean;
  editor: typeof DASHBOARD_BLOCK_SCHEMA.BlockNoteEditor;
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
          editor.focus();
        });

        return () => {
          cancelAnimationFrame(rafId);
        };
      }
    }
  }, [shouldFocus, editor, containerElement]);

  return null;
};
