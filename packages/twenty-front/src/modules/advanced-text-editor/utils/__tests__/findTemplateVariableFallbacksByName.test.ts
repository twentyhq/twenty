import type { JSONContent } from '@tiptap/react';

import { findTemplateVariableFallbacksByName } from '@/advanced-text-editor/utils/findTemplateVariableFallbacksByName';

const buildEditorContent = (rawTemplateVariables: string[]): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'section',
      content: [
        {
          type: 'paragraph',
          content: rawTemplateVariables.map((rawTemplateVariable) => ({
            type: 'variableTag',
            attrs: { variable: rawTemplateVariable },
          })),
        },
      ],
    },
  ],
});

describe('findTemplateVariableFallbacksByName', () => {
  it('should prefer the raw content fallback over a different editor content fallback', () => {
    expect(
      findTemplateVariableFallbacksByName({
        rawContent: 'Hi {{name.firstName | default: "there"}}',
        editorContent: buildEditorContent([
          '{{name.firstName | default: "friend"}}',
        ]),
      }).get('name.firstName'),
    ).toBe('there');
  });

  it('should find the fallback of each variable on chips nested in the editor content', () => {
    expect(
      findTemplateVariableFallbacksByName({
        rawContent: 'Hi {{name.firstName}}',
        editorContent: buildEditorContent([
          '{{jobTitle | default: "builder"}}',
          '{{name.firstName}}',
          '{{name.firstName | default: "friend"}}',
        ]),
      }),
    ).toEqual(
      new Map([
        ['jobTitle', 'builder'],
        ['name.firstName', 'friend'],
      ]),
    );
  });
});
