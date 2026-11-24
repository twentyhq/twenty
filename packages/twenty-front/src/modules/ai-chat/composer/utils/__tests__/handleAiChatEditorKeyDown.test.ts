import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TOUCH_DEVICE_MEDIA_QUERY } from 'twenty-ui/utilities';

import { handleAiChatEditorKeyDown } from '@/ai-chat/composer/utils/handleAiChatEditorKeyDown';

const FIRST_LINE_WITH_LINE_BREAK = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'First line' }, { type: 'hardBreak' }],
    },
  ],
};

const setIsTouchDevice = (isTouchDevice: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: isTouchDevice && query === TOUCH_DEVICE_MEDIA_QUERY,
    }),
  });
};

describe('handleAiChatEditorKeyDown', () => {
  const originalMatchMedia = window.matchMedia;
  let editor: Editor;
  let onSend: jest.Mock;

  const pressEnter = ({ shiftKey = false } = {}) => {
    editor.view.dom.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  };

  beforeEach(() => {
    onSend = jest.fn();
    editor = new Editor({
      extensions: [Document, Paragraph, Text, HardBreak],
      content: '<p>First line</p>',
      editorProps: {
        handleKeyDown: (view, event) =>
          handleAiChatEditorKeyDown({ view, event, onSend }),
      },
    });
    editor.commands.focus('end');
  });

  afterEach(() => {
    editor.destroy();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should send on Enter with a keyboard', () => {
    setIsTouchDevice(false);

    pressEnter();

    expect(onSend).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'First line' }),
    );
  });

  it('should insert a line break on Shift+Enter with a keyboard', () => {
    setIsTouchDevice(false);

    pressEnter({ shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
    expect(editor.getJSON()).toEqual(FIRST_LINE_WITH_LINE_BREAK);
  });

  it('should insert the same line break on Enter on a touch device', () => {
    setIsTouchDevice(true);

    pressEnter();

    expect(onSend).not.toHaveBeenCalled();
    expect(editor.getJSON()).toEqual(FIRST_LINE_WITH_LINE_BREAK);
  });
});
