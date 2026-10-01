import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  CANVAS_THEME_DEFAULTS,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';

// The envelope block reads the body width the Design panel writes onto the document; default until the editor mounts.
export const useCampaignCanvasWidth = (editor: Editor | null): string => {
  const canvasWidth = useEditorState({
    editor,
    // Reads the editor passed in: the snapshot one can still be the instance `useEditor` destroyed when recreating it.
    selector: () =>
      isDefined(editor)
        ? (resolveCanvasTheme(editor.state.doc.attrs.canvasTheme)?.width ??
          CANVAS_THEME_DEFAULTS.width)
        : CANVAS_THEME_DEFAULTS.width,
  });

  return canvasWidth ?? CANVAS_THEME_DEFAULTS.width;
};
