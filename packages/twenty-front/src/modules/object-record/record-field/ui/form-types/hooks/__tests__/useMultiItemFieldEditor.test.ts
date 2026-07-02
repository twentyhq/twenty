import { renderHook } from '@testing-library/react';
import type { EditorView } from '@tiptap/pm/view';
import type { Editor } from '@tiptap/react';

import { useMultiItemFieldEditor } from '@/object-record/record-field/ui/form-types/hooks/useMultiItemFieldEditor';

const triggerKeyDown = (editor: Editor, event: KeyboardEvent) => {
  let isHandled = false;

  editor.view.someProp('handleKeyDown', (handleKeyDown) => {
    isHandled = handleKeyDown(editor.view as EditorView, event) || isHandled;
  });

  return isHandled;
};

const setup = (
  options: Partial<{
    readonly: boolean;
    defaultValue: string | null;
  }> = {},
) => {
  const onUpdate = jest.fn();

  const { result, unmount } = renderHook(() =>
    useMultiItemFieldEditor({
      placeholder: 'Enter recipient',
      readonly: options.readonly ?? false,
      defaultValue: options.defaultValue,
      onUpdate,
    }),
  );

  if (result.current === null || result.current === undefined) {
    throw new Error('Editor not created');
  }

  return { editor: result.current, unmount };
};

describe('useMultiItemFieldEditor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should ignore stale queued conversion when cursor moved before callback execution', () => {
    const { editor, unmount } = setup({ defaultValue: null });

    editor.commands.insertContent('abc');
    editor.commands.focus('end');

    const isHandled = triggerKeyDown(
      editor,
      new KeyboardEvent('keydown', { key: ' ', cancelable: true }),
    );

    expect(isHandled).toBe(true);

    editor.commands.setTextSelection(1);

    expect(() => {
      jest.runOnlyPendingTimers();
    }).not.toThrow();

    unmount();
  });
});
