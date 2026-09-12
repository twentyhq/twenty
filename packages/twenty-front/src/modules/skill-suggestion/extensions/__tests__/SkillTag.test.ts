import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { SkillTag } from '@/skill-suggestion/extensions/SkillTag';

// Mock ReactNodeViewRenderer since we're testing in a non-DOM environment
jest.mock('@tiptap/react', () => ({
  mergeAttributes: jest.requireActual('@tiptap/react').mergeAttributes,
  ReactNodeViewRenderer: () => () => ({}),
}));

describe('SkillTag', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, SkillTag],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor?.destroy();
  });

  it('should register as an inline atom node', () => {
    const skillTagType = editor.schema.nodes.skillTag;

    expect(skillTagType).toBeDefined();
    expect(skillTagType.isInline).toBe(true);
    expect(skillTagType.isAtom).toBe(true);
  });

  it('should serialize a skill tag to the [[skill:...]] reference format', () => {
    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Use ' },
            {
              type: 'skillTag',
              attrs: {
                skillId: 'skill-123',
                name: 'workflow-building',
                label: 'Workflow building',
                icon: 'IconSettingsAutomation',
              },
            },
            { type: 'text', text: ' now' },
          ],
        },
      ],
    });

    expect(editor.getText()).toBe(
      'Use [[skill:skill-123:Workflow building]] now',
    );
  });
});
