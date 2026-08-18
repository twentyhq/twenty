import { type Editor } from '@tiptap/core';

export const hasEditorExtension = (editor: Editor, extensionName: string) =>
  editor.extensionManager.extensions.some(
    (extension) => extension.name === extensionName,
  );
