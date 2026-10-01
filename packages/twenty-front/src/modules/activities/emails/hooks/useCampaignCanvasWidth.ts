import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  CANVAS_THEME_DEFAULTS,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';

// The Design panel writes the body width onto the document; the default applies until the editor mounts.
export const useCampaignCanvasWidth = (editor: Editor | null): string => {
  const canvasWidth = useEditorState({
    editor,
    // The snapshot editor can still be the instance `useEditor` destroyed when recreating it.
    selector: () =>
      isDefined(editor)
        ? (resolveCanvasTheme(editor.state.doc.attrs.canvasTheme)?.width ??
          CANVAS_THEME_DEFAULTS.width)
        : CANVAS_THEME_DEFAULTS.width,
  });

  return canvasWidth ?? CANVAS_THEME_DEFAULTS.width;
};
