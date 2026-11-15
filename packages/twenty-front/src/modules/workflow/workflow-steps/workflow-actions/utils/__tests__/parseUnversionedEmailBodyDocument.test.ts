import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { parseUnversionedEmailBodyDocument } from '@/workflow/workflow-steps/workflow-actions/utils/parseUnversionedEmailBodyDocument';

describe('parseUnversionedEmailBodyDocument', () => {
  it('opens an email document saved without a schema version', () => {
    const content = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
    ];

    expect(
      parseUnversionedEmailBodyDocument(
        JSON.stringify({ type: 'doc', content }),
      ),
    ).toEqual({ type: 'doc', content });
  });

  it('opens an empty editor for an HTML string', () => {
    expect(parseUnversionedEmailBodyDocument('<p>Hello</p>')).toEqual(
      getInitialEditorContent(''),
    );
  });
});
