import { Editor } from '@tiptap/core';

import { buildAdvancedTextEditorCoreExtensions } from '@/advanced-text-editor/constants/AdvancedTextEditorCoreExtensions';
import { AI_CHAT_EDITOR_PROFILE } from '@/ai-chat/composer/constants/AiChatEditorProfile';
import { buildSuggestedViewFieldsAiPrompt } from '@/settings/applications/utils/buildSuggestedViewFieldsAiPrompt';

describe('buildSuggestedViewFieldsAiPrompt', () => {
  it('builds one line per view that the AI chat composer accepts', () => {
    const editor = new Editor({
      extensions: [
        ...buildAdvancedTextEditorCoreExtensions({ placeholder: undefined }),
        ...AI_CHAT_EDITOR_PROFILE.buildExtensions(),
      ],
    });

    editor.commands.setContent(
      buildSuggestedViewFieldsAiPrompt({
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
      }),
    );

    const text = editor.getText({ blockSeparator: '\n' });

    editor.destroy();

    expect(text).toBe(
      [
        'Add these Last contact columns at the end of my views:',
        '• All People: Last contact, Last contact by',
        '• All Companies: Last contact',
      ].join('\n'),
    );
  });
});
