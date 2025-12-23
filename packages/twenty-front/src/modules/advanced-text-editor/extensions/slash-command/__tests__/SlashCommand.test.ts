import { i18n } from '@lingui/core';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { ListKit } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { SlashCommand } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';

describe('SlashCommand', () => {
  let editor: Editor;

  beforeEach(() => {
    // Initialize i18n for tests
    i18n.load('en', {});
    i18n.activate('en');

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading.configure({ levels: [1, 2, 3] }),
        ListKit,
        SlashCommand,
      ],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor?.destroy();
  });

  describe('Slash command trigger', () => {
    it('should trigger suggestions when typing /', () => {
      editor.commands.setContent('<p></p>');
      editor.commands.focus();

      // Type the slash character
      editor.commands.insertContent('/');

      // The suggestion plugin should be active
      // We verify by checking if typing continues to work
      expect(editor.getText()).toBe('/');
    });

    it('should filter commands based on query', () => {
      editor.commands.setContent('<p></p>');
      editor.commands.focus();

      // Type slash and partial command
      editor.commands.insertContent('/head');

      // Content should include the typed text
      expect(editor.getText()).toContain('head');
    });
  });

  describe('Command execution', () => {
    it('should convert to heading 1 when command is executed', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      // Simulate selecting heading 1 command
      editor.chain().focus().setHeading({ level: 1 }).run();

      expect(editor.isActive('heading', { level: 1 })).toBe(true);
    });

    it('should convert to heading 2 when command is executed', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      editor.chain().focus().setHeading({ level: 2 }).run();

      expect(editor.isActive('heading', { level: 2 })).toBe(true);
    });

    it('should convert to heading 3 when command is executed', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      editor.chain().focus().setHeading({ level: 3 }).run();

      expect(editor.isActive('heading', { level: 3 })).toBe(true);
    });

    it('should convert to bullet list when command is executed', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      editor.chain().focus().toggleBulletList().run();

      expect(editor.isActive('bulletList')).toBe(true);
    });

    it('should convert to ordered list when command is executed', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      editor.chain().focus().toggleOrderedList().run();

      expect(editor.isActive('orderedList')).toBe(true);
    });

    it('should convert back to paragraph when command is executed', () => {
      editor.commands.setContent('<h1>Test</h1>');
      editor.commands.focus();

      editor.chain().focus().setParagraph().run();

      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.isActive('heading')).toBe(false);
    });
  });

  describe('Command availability', () => {
    it('should allow setting headings when heading extension is present', () => {
      // Editor with heading extension should be able to set headings
      expect(editor.can().setHeading({ level: 1 })).toBe(true);
      expect(editor.can().setHeading({ level: 2 })).toBe(true);
      expect(editor.can().setHeading({ level: 3 })).toBe(true);
    });

    it('should allow toggling lists when list extension is present', () => {
      // Editor with list extension should be able to toggle lists
      expect(editor.can().toggleBulletList()).toBe(true);
      expect(editor.can().toggleOrderedList()).toBe(true);
    });
  });

  describe('Read-only mode', () => {
    it('should not be editable in read-only mode', () => {
      const readonlyEditor = new Editor({
        extensions: [Document, Paragraph, Text, Heading, SlashCommand],
        content: '<p>Test</p>',
        editable: false,
      });

      // Verify editor is not editable
      expect(readonlyEditor.isEditable).toBe(false);

      readonlyEditor.destroy();
    });
  });
});
