import { type EditorView } from '@tiptap/pm/view';

const LINE_BREAK_PATTERN = /\s*\n\s*/g;

export const handleValidationRuleEditorPaste = (
  view: EditorView,
  event: ClipboardEvent,
): boolean => {
  const pastedText = event.clipboardData?.getData('text/plain') ?? '';

  view.dispatch(
    view.state.tr.insertText(pastedText.replace(LINE_BREAK_PATTERN, ' ')),
  );

  return true;
};
