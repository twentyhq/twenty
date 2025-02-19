import { JSONContent } from '@tiptap/react';
import { parseEditorContent } from '../parseEditorContent';

describe('parseEditorContent', () => {
  it('should parse empty doc', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [],
    };

    expect(parseEditorContent(input)).toBe('');
  });

  it('should parse simple text node', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello world',
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('Hello world');
  });

  it('should parse variable tag node', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'variableTag',
              attrs: {
                variable: '{{user.name}}',
              },
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('{{user.name}}');
  });

  it('should parse mixed content with text and variables', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello ',
            },
            {
              type: 'variableTag',
              attrs: {
                variable: '{{user.name}}',
              },
            },
            {
              type: 'text',
              text: ', welcome to ',
            },
            {
              type: 'variableTag',
              attrs: {
                variable: '{{app.name}}',
              },
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe(
      'Hello {{user.name}}, welcome to {{app.name}}',
    );
  });

  it('should parse multiple paragraphs', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'First line',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second line',
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('First lineSecond line');
  });

  it('should handle missing content array', () => {
    const input: JSONContent = {
      type: 'doc',
    };

    expect(parseEditorContent(input)).toBe('');
  });

  it('should handle missing text in text node', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('');
  });

  it('should handle missing variable in variableTag node', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'variableTag',
              attrs: {},
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('');
  });

  it('should handle unknown node types', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'unknownType',
              content: [
                {
                  type: 'text',
                  text: 'This should be ignored',
                },
              ],
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('');
  });

  it('should parse complex nested structure', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello ',
            },
            {
              type: 'variableTag',
              attrs: {
                variable: '{{user.firstName}}',
              },
            },
            {
              type: 'text',
              text: ' ',
            },
            {
              type: 'variableTag',
              attrs: {
                variable: '{{user.lastName}}',
              },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Your ID is: ',
            },
            {
              type: 'variableTag',
              attrs: {
                variable: '{{user.id}}',
              },
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe(
      'Hello {{user.firstName}} {{user.lastName}}Your ID is: {{user.id}}',
    );
  });

  it('should handle hard breaks', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'First line',
            },
          ],
        },
        {
          type: 'hardBreak',
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second line',
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe('First line\nSecond line');
  });

  it('should handle spaces between variables correctly', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'variableTag',
              attrs: { variable: '{{user.firstName}}' },
            },
            {
              type: 'text',
              text: '\u00A0', // NBSP character
            },
            {
              type: 'variableTag',
              attrs: { variable: '{{user.lastName}}' },
            },
          ],
        },
      ],
    };

    expect(parseEditorContent(input)).toBe(
      '{{user.firstName}} {{user.lastName}}',
    );
  });
});
