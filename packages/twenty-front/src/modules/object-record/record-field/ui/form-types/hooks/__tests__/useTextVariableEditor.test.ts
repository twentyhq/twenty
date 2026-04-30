import { renderHook } from '@testing-library/react';
import { Fragment, Slice } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';

import { parseEditorContent } from '@/workflow/workflow-variables/utils/parseEditorContent';
import { useTextVariableEditor } from '@/object-record/record-field/ui/form-types/hooks/useTextVariableEditor';

const mockPasteEvent = (text: string) =>
  ({
    clipboardData: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    },
  }) as unknown as ClipboardEvent;

const paste = (editor: Editor, text: string): boolean => {
  const handlePaste = editor.view.props.handlePaste!;
  const { schema } = editor.view.state;
  const slice = text
    ? new Slice(Fragment.from(schema.text(text)), 0, 0)
    : Slice.empty;

  return handlePaste(editor.view, mockPasteEvent(text), slice) as boolean;
};

const content = (editor: Editor) => parseEditorContent(editor.getJSON());

const countHardBreaks = (editor: Editor) =>
  editor
    .getJSON()
    .content?.[0]?.content?.filter(
      (n: { type: string }) => n.type === 'hardBreak',
    )?.length ?? 0;

const setup = (
  opts: Partial<{
    multiline: boolean;
    readonly: boolean;
    defaultValue: string | null;
  }> = {},
) => {
  const onUpdate = jest.fn();
  const { result, unmount } = renderHook(() =>
    useTextVariableEditor({
      placeholder: 'Enter text',
      multiline: opts.multiline ?? false,
      readonly: opts.readonly ?? false,
      defaultValue: opts.defaultValue ?? undefined,
      onUpdate,
    }),
  );

  if (result.current === null || result.current === undefined)
    throw new Error('Editor not created');
  return { editor: result.current, unmount };
};

describe('useTextVariableEditor', () => {
  let teardown: (() => void) | undefined;
  afterEach(() => teardown?.());

  const use = (opts: Parameters<typeof setup>[0] = {}) => {
    const { editor, unmount } = setup(opts);
    teardown = unmount;
    return editor;
  };

  describe('initialization', () => {
    it('should set content from defaultValue', () => {
      expect(content(use({ defaultValue: 'hello' }))).toBe('hello');
    });

    it('should preserve line breaks in multiline defaultValue', () => {
      const editor = use({
        multiline: true,
        defaultValue: 'a\nb\nc',
      });
      expect(countHardBreaks(editor)).toBe(2);
    });

    it('should respect readonly', () => {
      expect(use({ readonly: true }).isEditable).toBe(false);
      teardown?.();
      expect(use({ readonly: false }).isEditable).toBe(true);
    });
  });

  describe('Enter key', () => {
    const pressEnter = (editor: Editor, shift = false) => {
      const handler = editor.view.props.handleKeyDown!;
      return handler(
        editor.view,
        new KeyboardEvent('keydown', {
          key: 'Enter',
          shiftKey: shift,
          cancelable: true,
        }),
      );
    };

    it('should insert hardBreak in multiline mode', () => {
      const editor = use({ multiline: true, defaultValue: 'hi' });
      editor.commands.focus('end');
      pressEnter(editor);
      expect(countHardBreaks(editor)).toBe(1);
    });

    it('should block Enter without inserting in non-multiline mode', () => {
      const editor = use({ defaultValue: 'hi' });
      editor.commands.focus('end');
      expect(pressEnter(editor)).toBe(true);
      expect(content(editor)).toBe('hi');
    });

    it('should not intercept Shift+Enter', () => {
      const editor = use({ multiline: true });
      expect(pressEnter(editor, true)).toBe(false);
    });
  });

  describe('paste — JSON', () => {
    it('should pretty-print JSON in multiline mode', () => {
      const editor = use({ multiline: true });
      paste(editor, '{"a":1,"b":2}');
      expect(content(editor)).toContain('"a": 1');
    });

    it('should compact-print JSON in non-multiline mode', () => {
      const editor = use({ multiline: false });
      paste(editor, '{"a":1,"b":2}');
      const c = content(editor);
      expect(c).not.toContain('\n');
      expect(c).toContain('"a":');
    });

    it('should not crash when cursor exceeds reformatted doc size', () => {
      const editor = use({ multiline: true });
      editor.commands.insertContent('x'.repeat(100));
      editor.commands.focus('end');
      expect(() => paste(editor, '{"a":1}')).not.toThrow();
    });

    it('should insert JSON at cursor without destroying existing content', () => {
      const editor = use({
        multiline: true,
        defaultValue: 'hello world',
      });
      editor.commands.focus();
      editor.commands.setTextSelection(8);

      paste(editor, '{"x":1}');

      const c = content(editor);
      expect(c).toContain('hello');
      expect(c).toContain('orld');
      expect(c).toContain('"x": 1');
    });

    it('should not treat primitives as JSON objects', () => {
      for (const val of ['"str"', '42', 'true', 'null']) {
        const { editor, unmount } = setup({ multiline: true });
        expect(paste(editor, val)).toBe(false);
        unmount();
      }
    });
  });

  describe('paste — multiline text', () => {
    it('should convert newlines to hardBreak nodes', () => {
      const editor = use({ multiline: true });
      paste(editor, 'a\nb\nc');
      expect(countHardBreaks(editor)).toBe(2);
      expect(content(editor)).toContain('a');
      expect(content(editor)).toContain('c');
    });

    it('should handle consecutive newlines', () => {
      const editor = use({ multiline: true });
      paste(editor, 'a\n\nc');
      expect(countHardBreaks(editor)).toBe(2);
    });

    it('should fall through in non-multiline mode', () => {
      const editor = use({ multiline: false });
      expect(paste(editor, 'a\nb')).toBe(false);
    });
  });

  describe('paste — plain text', () => {
    it('should fall through for text without newlines', () => {
      expect(paste(use({ multiline: true }), 'hello')).toBe(false);
    });

    it('should fall through for empty clipboard', () => {
      expect(paste(use({ multiline: true }), '')).toBe(false);
    });
  });
});
