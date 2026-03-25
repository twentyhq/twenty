import type { JSONContent } from '@tiptap/react';

import { parseMultiItemEditorContent } from '@/workflow/workflow-variables/utils/parseMultiItemEditorContent';

describe('parseMultiItemEditorContent', () => {
  it('should serialize textTags and variableTags as comma-separated string', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'textTag', attrs: { text: 'static@example.com' } },
            { type: 'variableTag', attrs: { variable: '{{user.email}}' } },
            { type: 'textTag', attrs: { text: 'another@example.com' } },
          ],
        },
      ],
    };

    expect(parseMultiItemEditorContent(input)).toBe(
      'static@example.com, {{user.email}}, another@example.com',
    );
  });

  it('should skip empty tags and ignore non-tag nodes', () => {
    const input: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'textTag', attrs: { text: 'valid@example.com' } },
            { type: 'textTag', attrs: { text: '' } },
            { type: 'variableTag', attrs: {} },
            { type: 'text', text: 'ignored plain text' },
            { type: 'textTag', attrs: { text: 'another@example.com' } },
          ],
        },
      ],
    };

    expect(parseMultiItemEditorContent(input)).toBe(
      'valid@example.com, another@example.com',
    );
  });

  it('should return empty string for empty or missing content', () => {
    expect(parseMultiItemEditorContent({ type: 'doc' })).toBe('');
    expect(parseMultiItemEditorContent({ type: 'doc', content: [] })).toBe('');
  });
});
