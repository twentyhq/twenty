import { parseLegacyWorkflowEmailBodyDocument } from '@/workflow/workflow-steps/workflow-actions/utils/parseLegacyWorkflowEmailBodyDocument';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

describe('parseLegacyWorkflowEmailBodyDocument', () => {
  it('stamps versionless TipTap documents stored by workflow email actions', () => {
    const content = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
    ];

    expect(
      parseLegacyWorkflowEmailBodyDocument(
        JSON.stringify({ type: 'doc', content }),
      ),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content,
    });
  });

  it('shows a body stored as HTML before the upgrade instead of an empty editor', () => {
    expect(
      parseLegacyWorkflowEmailBodyDocument('<p>Hello {{trigger.name}}</p>'),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'htmlDocument',
          attrs: { html: '<p>Hello {{trigger.name}}</p>' },
        },
      ],
    });
  });

  it('shows a body stored as plain text before the upgrade as lines and variable tags', () => {
    expect(
      parseLegacyWorkflowEmailBodyDocument('Hello {{trigger.name}}\nBye'),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'variableTag', attrs: { variable: '{{trigger.name}}' } },
            { type: 'hardBreak' },
            { type: 'text', text: 'Bye' },
          ],
        },
      ],
    });
  });

  it('keeps a structurally valid document the email schema rejects', () => {
    const document = {
      type: 'doc',
      content: [{ type: 'taskList', content: [] }],
    };

    expect(
      parseLegacyWorkflowEmailBodyDocument(JSON.stringify(document)),
    ).toEqual(document);
  });
});
