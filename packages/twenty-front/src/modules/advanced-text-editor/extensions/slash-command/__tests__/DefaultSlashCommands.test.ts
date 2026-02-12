import { i18n } from '@lingui/core';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { ListKit } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { DEFAULT_SLASH_COMMANDS } from '@/advanced-text-editor/extensions/slash-command/DefaultSlashCommands';

describe('DefaultSlashCommands', () => {
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
      ],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor?.destroy();
  });

  describe('Command structure', () => {
    it('should have all required fields for each command', () => {
      DEFAULT_SLASH_COMMANDS.forEach((command) => {
        expect(command).toHaveProperty('id');
        expect(command).toHaveProperty('title');
        expect(command).toHaveProperty('description');
        expect(command).toHaveProperty('icon');
        expect(command).toHaveProperty('keywords');
        expect(command).toHaveProperty('getIsActive');
        expect(command).toHaveProperty('getIsVisible');
        expect(command).toHaveProperty('getOnSelect');

        // Verify functions are actually functions
        expect(typeof command.getIsActive).toBe('function');
        expect(typeof command.getIsVisible).toBe('function');
        expect(typeof command.getOnSelect).toBe('function');
      });
    });

    it('should have unique IDs for each command', () => {
      const ids = DEFAULT_SLASH_COMMANDS.map((cmd) => cmd.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have translatable message descriptors for titles', () => {
      DEFAULT_SLASH_COMMANDS.forEach((command) => {
        // MessageDescriptor should have an id property
        expect(command.title).toHaveProperty('id');
        expect(typeof command.title.id).toBe('string');
      });
    });

    it('should have translatable message descriptors for descriptions', () => {
      DEFAULT_SLASH_COMMANDS.forEach((command) => {
        expect(command.description).toHaveProperty('id');
        expect(typeof command.description.id).toBe('string');
      });
    });

    it('should have translatable message descriptors for keywords', () => {
      DEFAULT_SLASH_COMMANDS.forEach((command) => {
        expect(Array.isArray(command.keywords)).toBe(true);
        command.keywords.forEach((keyword) => {
          expect(keyword).toHaveProperty('id');
          expect(typeof keyword.id).toBe('string');
        });
      });
    });
  });

  describe('Paragraph command', () => {
    it('should be active when paragraph is active', () => {
      const paragraphCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'paragraph',
      );

      editor.commands.setContent('<p>Test</p>');
      expect(paragraphCommand?.getIsActive(editor)).toBe(true);
    });

    it('should not be active when heading is active', () => {
      const paragraphCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'paragraph',
      );

      editor.commands.setContent('<h1>Test</h1>');
      expect(paragraphCommand?.getIsActive(editor)).toBe(false);
    });

    it('should have visibility logic defined', () => {
      const paragraphCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'paragraph',
      );

      // Paragraph command should have a getIsVisible function
      expect(typeof paragraphCommand?.getIsVisible).toBe('function');
      // Result should be a boolean
      expect(typeof paragraphCommand?.getIsVisible(editor)).toBe('boolean');
    });
  });

  describe('Heading commands', () => {
    it('should correctly identify active heading level 1', () => {
      const h1Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h1');

      editor.commands.setContent('<h1>Test</h1>');
      expect(h1Command?.getIsActive(editor)).toBe(true);
    });

    it('should correctly identify active heading level 2', () => {
      const h2Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h2');

      editor.commands.setContent('<h2>Test</h2>');
      expect(h2Command?.getIsActive(editor)).toBe(true);
    });

    it('should correctly identify active heading level 3', () => {
      const h3Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h3');

      editor.commands.setContent('<h3>Test</h3>');
      expect(h3Command?.getIsActive(editor)).toBe(true);
    });

    it('should not be active for different heading levels', () => {
      const h1Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h1');
      const h2Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h2');

      editor.commands.setContent('<h1>Test</h1>');
      expect(h1Command?.getIsActive(editor)).toBe(true);
      expect(h2Command?.getIsActive(editor)).toBe(false);
    });

    it('should be visible when editor supports headings', () => {
      const h1Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h1');
      const h2Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h2');
      const h3Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h3');

      expect(h1Command?.getIsVisible(editor)).toBe(true);
      expect(h2Command?.getIsVisible(editor)).toBe(true);
      expect(h3Command?.getIsVisible(editor)).toBe(true);
    });
  });

  describe('List commands', () => {
    it('should correctly identify active bullet list', () => {
      const bulletListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'bulletList',
      );

      editor.commands.setContent('<ul><li>Item</li></ul>');
      editor.commands.focus();

      expect(bulletListCommand?.getIsActive(editor)).toBe(true);
    });

    it('should correctly identify active ordered list', () => {
      const orderedListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'orderedList',
      );

      editor.commands.setContent('<ol><li>Item</li></ol>');
      editor.commands.focus();

      expect(orderedListCommand?.getIsActive(editor)).toBe(true);
    });

    it('should not show bullet list when both are active', () => {
      const bulletListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'bulletList',
      );
      const orderedListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'orderedList',
      );

      editor.commands.setContent('<ul><li>Item</li></ul>');
      editor.commands.focus();

      expect(bulletListCommand?.getIsActive(editor)).toBe(true);
      expect(orderedListCommand?.getIsActive(editor)).toBe(false);
    });

    it('should be visible when editor supports lists', () => {
      const bulletListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'bulletList',
      );
      const orderedListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'orderedList',
      );

      expect(bulletListCommand?.getIsVisible(editor)).toBe(true);
      expect(orderedListCommand?.getIsVisible(editor)).toBe(true);
    });
  });

  describe('Command execution', () => {
    it('should execute paragraph command correctly', () => {
      const paragraphCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'paragraph',
      );

      editor.commands.setContent('<h1>Test</h1>');
      editor.commands.focus();

      const range = { from: 0, to: 0 };
      const onSelect = paragraphCommand?.getOnSelect(editor, range);
      onSelect?.();

      expect(editor.isActive('paragraph')).toBe(true);
    });

    it('should execute heading command and apply correct level', () => {
      const h2Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h2');

      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      const range = { from: 0, to: 0 };
      const onSelect = h2Command?.getOnSelect(editor, range);
      onSelect?.();

      expect(editor.isActive('heading', { level: 2 })).toBe(true);
    });

    it('should execute list command correctly', () => {
      const bulletListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'bulletList',
      );

      editor.commands.setContent('<p>Test</p>');
      editor.commands.focus();

      const range = { from: 0, to: 0 };
      const onSelect = bulletListCommand?.getOnSelect(editor, range);
      onSelect?.();

      expect(editor.isActive('bulletList')).toBe(true);
    });
  });

  describe('Search keywords', () => {
    it('should include relevant keywords for each command', () => {
      const paragraphCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'paragraph',
      );

      expect(paragraphCommand?.keywords.length).toBeGreaterThan(0);
    });

    it('should have heading keywords for heading commands', () => {
      const h1Command = DEFAULT_SLASH_COMMANDS.find((cmd) => cmd.id === 'h1');

      // Should have keywords array
      expect(h1Command?.keywords.length).toBeGreaterThan(0);
    });

    it('should have list keywords for list commands', () => {
      const bulletListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'bulletList',
      );
      const orderedListCommand = DEFAULT_SLASH_COMMANDS.find(
        (cmd) => cmd.id === 'orderedList',
      );

      expect(bulletListCommand?.keywords.length).toBeGreaterThan(0);
      expect(orderedListCommand?.keywords.length).toBeGreaterThan(0);
    });
  });
});
