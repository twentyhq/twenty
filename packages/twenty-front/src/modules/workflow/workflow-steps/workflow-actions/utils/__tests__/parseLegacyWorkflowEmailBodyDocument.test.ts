import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
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

  it('opens an empty editor for a body that is not a document', () => {
    expect(parseLegacyWorkflowEmailBodyDocument('<p>Hello</p>')).toEqual(
      getInitialEditorContent(''),
    );
  });
});
