import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { MentionTag } from '@/mention/extensions/MentionTag';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { isAgentChatAssistantMentionedInSerializedDocument } from '@/ai/utils/isAgentChatAssistantMentionedInSerializedDocument';
import { parseChatReferences } from '@/ai/utils/parseChatReferences';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

jest.mock('@/mention/components/MentionChip', () => ({
  MentionChip: () => null,
}));

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
    it('preserves assistant identity and its saved label through editor reload and markdown export', () => {
      const label = 'Scout Bot: [team] *helper* 100%';

      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Ask ' },
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'agentChatAssistant',
                  objectNameSingular: 'agentChatAssistant',
                  label,
                },
              },
              { type: 'text', text: ', @Ada wrote this.' },
            ],
          },
        ],
      });

      const savedDocument = serializeJsonContentAsAdvancedTextEditorDocument(
        editor.getJSON(),
      );
      const messageText = editor.getText();

      editor.commands.setContent(JSON.parse(savedDocument));

      expect(editor.getText()).toBe(messageText);
      expect(tipTapDocumentToMarkdown(savedDocument)).toBe(messageText);
      expect(parseChatReferences(messageText)).toEqual([
        expect.objectContaining({
          kind: 'record',
          objectNameSingular: 'agentChatAssistant',
          recordId: 'agentChatAssistant',
          displayName: label,
        }),
      ]);
      expect(messageText.endsWith(', @Ada wrote this.')).toBe(true);
      expect(
        isAgentChatAssistantMentionedInSerializedDocument(savedDocument),
      ).toBe(true);
    });

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
    it('should insert a picked record as a reference followed by a space', () => {
      editor.commands.insertContent(
        getMentionTagContent({
          recordId: 'test-id',
          objectNameSingular: 'opportunity',
          label: 'Big Deal',
          imageUrl: null,
        }),
      );

      expect(editor.getText()).toBe('[[record:opportunity:test-id:Big Deal]] ');
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

    it('should keep the participant flag out of the copied HTML', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'person-id',
                  objectNameSingular: 'person',
                  label: 'Linus',
                },
              },
              {
                type: 'mentionTag',
                attrs: {
                  recordId: 'member-id',
                  objectNameSingular: 'workspaceMember',
                  label: 'Grace',
                  shouldAddAsParticipant: true,
                },
              },
            ],
          },
        ],
      });

      const html = editor.getHTML();
      const renderedMentionTexts = Array.from(
        new DOMParser()
          .parseFromString(html, 'text/html')
          .querySelectorAll('.mention-tag'),
      ).map((mention) => mention.textContent);

      expect(renderedMentionTexts).toEqual(['@Linus', '@Grace']);
      expect(html).not.toContain('shouldAddAsParticipant');
    });
  });
});
