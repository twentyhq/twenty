import { type Editor } from '@tiptap/core';
import { isDefined } from 'twenty-shared/utils';

// A destroyed editor drops its extension manager, and components can still hold
// a destroyed instance for a render, either from a state that has not been
// updated yet or from a stale tiptap snapshot.
export const hasEditorExtension = (editor: Editor, extensionName: string) =>
  isDefined(editor.extensionManager) &&
  editor.extensionManager.extensions.some(
    (extension) => extension.name === extensionName,
  );
