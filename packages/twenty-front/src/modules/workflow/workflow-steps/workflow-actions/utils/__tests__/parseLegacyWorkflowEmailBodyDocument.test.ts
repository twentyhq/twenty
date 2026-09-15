import { parseLegacyWorkflowEmailBodyDocument } from '@/workflow/workflow-steps/workflow-actions/utils/parseLegacyWorkflowEmailBodyDocument';

describe('parseLegacyWorkflowEmailBodyDocument', () => {
  it('preserves versionless TipTap documents stored by workflow email actions', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };

    expect(
      parseLegacyWorkflowEmailBodyDocument(JSON.stringify(document)),
    ).toEqual(document);
  });

  it('preserves HTML stored by workflow email actions', () => {
    expect(parseLegacyWorkflowEmailBodyDocument('<p>Hello</p>')).toBe(
      '<p>Hello</p>',
    );
  });

  it('converts plain text stored by workflow email actions', () => {
    expect(parseLegacyWorkflowEmailBodyDocument('Hello')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    });
  });
});
