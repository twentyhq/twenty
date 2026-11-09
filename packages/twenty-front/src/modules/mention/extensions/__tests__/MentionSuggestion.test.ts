import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';

// Mock ReactNodeViewRenderer and ReactRenderer (DOM-dependent)
jest.mock('@tiptap/react', () => ({
  mergeAttributes: jest.requireActual('@tiptap/react').mergeAttributes,
  ReactNodeViewRenderer: () => () => ({}),
  ReactRenderer: jest.fn().mockImplementation(() => ({
    element: document.createElement('div'),
    ref: null,
    updateProps: jest.fn(),
    destroy: jest.fn(),
  })),
}));

describe('MentionSuggestion', () => {
  let editor: Editor;
  let mockSearchFn: jest.Mock;

  beforeEach(() => {
    mockSearchFn = jest.fn().mockResolvedValue([]);

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        MentionTag,
        MentionSuggestion.configure({
          searchMentionRecords: mockSearchFn,
        }),
      ],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor?.destroy();
  });

  it('should register the extension', () => {
    const extension = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'mention-suggestion',
    );

    expect(extension).toBeDefined();
  });

  it('should add ProseMirror plugins', () => {
    expect(MENTION_SUGGESTION_PLUGIN_KEY.get(editor.state)).toBeDefined();
  });

  it('should accept @ character in editor content', () => {
    editor.commands.setContent('<p></p>');
    editor.commands.focus();
    editor.commands.insertContent('@');

    expect(editor.getText()).toContain('@');
  });

  it('should use default empty search function when not configured', () => {
    const unconfiguredEditor = new Editor({
      extensions: [Document, Paragraph, Text, MentionTag, MentionSuggestion],
      content: '<p></p>',
    });

    const extension = unconfiguredEditor.extensionManager.extensions.find(
      (ext) => ext.name === 'mention-suggestion',
    );

    expect(extension?.options.searchMentionRecords).toBeDefined();

    unconfiguredEditor.destroy();
  });
});
