import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  CANVAS_THEME_DEFAULTS,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';

// The body renders as a centred page whose width the Design panel writes onto
// the document, so the envelope block above it reads that width rather than
// assuming the default. Falls back to the default until the editor mounts,
// which is the same value for a campaign that never changed its design.
export const useCampaignCanvasWidth = (editor: Editor | null): string => {
  const canvasWidth = useEditorState({
    editor,
    // Reading the editor passed in rather than the snapshot one, which keeps
    // pointing at the instance `useEditor` destroyed when it recreated the
    // editor, until the next transaction refreshes the snapshot.
    selector: () =>
      isDefined(editor)
        ? (resolveCanvasTheme(editor.state.doc.attrs.canvasTheme)?.width ??
          CANVAS_THEME_DEFAULTS.width)
        : CANVAS_THEME_DEFAULTS.width,
  });

  return canvasWidth ?? CANVAS_THEME_DEFAULTS.width;
};
