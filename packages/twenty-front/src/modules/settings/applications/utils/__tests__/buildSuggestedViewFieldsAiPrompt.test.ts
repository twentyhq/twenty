import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { buildSuggestedViewFieldsAiPrompt } from '@/settings/applications/utils/buildSuggestedViewFieldsAiPrompt';

describe('buildSuggestedViewFieldsAiPrompt', () => {
  it('lists one line per view with its fields and view id', () => {
    const document = buildSuggestedViewFieldsAiPrompt({
      applicationName: 'Last contact',
      suggestedViewFieldGroups: [
        {
          viewId: 'all-people-view-id',
          viewName: 'All People',
          fields: [
            { id: 'last-contact-field-id', label: 'Last contact' },
            { id: 'last-contact-by-field-id', label: 'Last contact by' },
          ],
        },
        {
          viewId: 'all-companies-view-id',
          viewName: 'All Companies',
          fields: [
            { id: 'company-last-contact-field-id', label: 'Last contact' },
          ],
        },
      ],
    });

    expect(
      tipTapDocumentToMarkdown(
        serializeJsonContentAsAdvancedTextEditorDocument(document),
      ).trim(),
    ).toBe(
      [
        'Add these Last contact columns at the end of my views:',
        '',
        '- **All People**: Last contact, Last contact by `all-people-view-id`',
        '- **All Companies**: Last contact `all-companies-view-id`',
      ].join('\n'),
    );
  });
});
