import { Extension } from '@tiptap/core';

// Forms that submit on Mod-Enter must not also get the hard break HardBreak
// binds to it. Shift-Enter still inserts one.
export const FormSubmitShortcut = Extension.create({
  name: 'formSubmitShortcut',
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => true,
    };
  },
});
