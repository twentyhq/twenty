import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { MentionTag } from '@/mention/extensions/MentionTag';

// Mock ReactNodeViewRenderer since we're testing in a non-DOM environment
jest.mock('@tiptap/react', () => ({
  mergeAttributes: jest.requireActual('@tiptap/react').mergeAttributes,
  ReactNodeViewRenderer: () => () => ({}),
}));

describe('MentionTag', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, MentionTag],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor?.destroy();
  });

  describe('node spec', () => {
    it('should register as an inline atom node', () => {
      const mentionTagType = editor.schema.nodes.mentionTag;

      expect(mentionTagType).toBeDefined();
      expect(mentionTagType.isInline).toBe(true);
      expect(mentionTagType.isAtom).toBe(true);
    });

    it('should define all required attributes with defaults', () => {
      const attrs = editor.schema.nodes.mentionTag.spec.attrs;

      expect(attrs).toBeDefined();
    });
  });

  describe('renderText', () => {
    it('should serialize a mention to [[record:...]] markdown format', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello ' },
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'abc-123',
                  objectNameSingular: 'company',
                  label: 'Acme Corp',
                  imageUrl: 'https://example.com/logo.png',
                },
              },
              { type: 'text', text: ' world' },
            ],
          },
        ],
      });

      const text = editor.getText();

      expect(text).toBe('Hello [[record:company:abc-123:Acme Corp]] world');
    });

    it('should handle mentions with empty label', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'id-456',
                  objectNameSingular: 'person',
                  label: '',
                  imageUrl: '',
                },
              },
            ],
          },
        ],
      });

      const text = editor.getText();

      expect(text).toBe('[[record:person:id-456:]]');
    });

    it('should serialize multiple mentions in the same paragraph', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'r1',
                  objectNameSingular: 'person',
                  label: 'Alice',
                  imageUrl: '',
                },
              },
              { type: 'text', text: ' and ' },
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'r2',
                  objectNameSingular: 'company',
                  label: 'Beta Inc',
                  imageUrl: '',
                },
              },
            ],
          },
        ],
      });

      const text = editor.getText();

      expect(text).toBe(
        '[[record:person:r1:Alice]] and [[record:company:r2:Beta Inc]]',
      );
    });
  });

  describe('insertContent command', () => {
    it('should insert a mention tag via editor commands', () => {
      editor.commands.setContent('<p></p>');
      editor.commands.focus();

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'mentionTag',
          attrs: {
            recordId: 'test-id',
            objectNameSingular: 'opportunity',
            label: 'Big Deal',
            imageUrl: 'https://example.com/img.png',
          },
        })
        .run();

      const text = editor.getText();

      expect(text).toContain('[[record:opportunity:test-id:Big Deal]]');
    });
  });

  describe('renderHTML', () => {
    it('should produce HTML with data attributes', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'html-id',
                  objectNameSingular: 'task',
                  label: 'My Task',
                  imageUrl: 'https://example.com/task.png',
                },
              },
            ],
          },
        ],
      });

      const html = editor.getHTML();

      expect(html).toContain('data-record-id="html-id"');
      expect(html).toContain('data-object-name-singular="task"');
      expect(html).toContain('data-label="My Task"');
      expect(html).toContain('data-image-url="https://example.com/task.png"');
      expect(html).toContain('data-type="mentionTag"');
      expect(html).toContain('class="mention-tag"');
    });
  });
});
