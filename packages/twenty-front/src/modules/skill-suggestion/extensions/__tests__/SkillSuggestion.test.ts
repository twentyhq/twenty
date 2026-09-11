import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { SKILL_SUGGESTION_PLUGIN_KEY } from '@/skill-suggestion/constants/SkillSuggestionPluginKey';
import { SkillSuggestion } from '@/skill-suggestion/extensions/SkillSuggestion';

// Mock ReactRenderer (DOM-dependent)
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

describe('SkillSuggestion', () => {
  let editor: Editor;
  let mockSearchSkills: jest.Mock;

  beforeEach(() => {
    mockSearchSkills = jest.fn().mockResolvedValue([]);

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        SkillSuggestion.configure({
          searchSkills: mockSearchSkills,
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
      (ext) => ext.name === 'skill-suggestion',
    );

    expect(extension).toBeDefined();
  });

  it('should add the suggestion ProseMirror plugin', () => {
    const hasSuggestionPlugin = editor.state.plugins.some(
      (plugin) =>
        (plugin as unknown as { key: string }).key === 'skill-suggestion$',
    );

    expect(hasSuggestionPlugin).toBe(true);
  });

  it('should expose the search function through storage', () => {
    const storage = editor.extensionStorage as unknown as Record<
      string,
      { searchSkills: jest.Mock }
    >;

    expect(storage['skill-suggestion'].searchSkills).toBe(mockSearchSkills);
  });

  const isSuggestionActive = () =>
    SKILL_SUGGESTION_PLUGIN_KEY.getState(editor.state)?.active === true;

  it('should open the suggestion when / is typed at the start of a line', () => {
    editor.commands.focus('end');
    editor.commands.insertContent('/');

    expect(isSuggestionActive()).toBe(true);
  });

  it('should open the suggestion when / follows a space', () => {
    editor.commands.focus('end');
    editor.commands.insertContent('Use /');

    expect(isSuggestionActive()).toBe(true);
  });

  it('should open the suggestion when / follows a hard break', () => {
    editor.commands.focus('end');
    editor.commands.insertContent('first line');
    editor.commands.setHardBreak();
    editor.commands.insertContent('/');

    expect(isSuggestionActive()).toBe(true);
  });

  it('should not open the suggestion when / is part of a word such as a URL', () => {
    editor.commands.focus('end');
    editor.commands.insertContent('https:/');

    expect(isSuggestionActive()).toBe(false);
  });

  it('should use default empty search function when not configured', () => {
    const unconfiguredEditor = new Editor({
      extensions: [Document, Paragraph, Text, SkillSuggestion],
      content: '<p></p>',
    });

    const extension = unconfiguredEditor.extensionManager.extensions.find(
      (ext) => ext.name === 'skill-suggestion',
    );

    expect(extension?.options.searchSkills).toBeDefined();

    unconfiguredEditor.destroy();
  });
});
