import { type Editor } from '@tiptap/core';
import { isDefined } from 'twenty-shared/utils';

// A destroyed editor drops its extension manager, and components can still hold one for a render.
export const hasEditorExtension = (editor: Editor, extensionName: string) =>
  isDefined(editor.extensionManager) &&
  editor.extensionManager.extensions.some(
    (extension) => extension.name === extensionName,
  );
