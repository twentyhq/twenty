import { Extension } from '@tiptap/core';

// Record forms submit on Mod-Enter, so the editor must not also insert the
// hard break HardBreak binds to it. Shift-Enter still inserts one.
export const FormSubmitShortcut = Extension.create({
  name: 'formSubmitShortcut',
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => true,
    };
  },
});
