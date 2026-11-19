import { t } from '@lingui/core/macro';
import { type JSONContent } from '@tiptap/core';

import { type SuggestedViewFieldGroup } from '@/settings/applications/utils/computeSuggestedViewFieldGroups';

export const buildSuggestedViewFieldsAiPrompt = ({
  applicationName,
  suggestedViewFieldGroups,
}: {
  applicationName: string;
  suggestedViewFieldGroups: SuggestedViewFieldGroup[];
}): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: t`Add these ${applicationName} columns at the end of my views:`,
        },
      ],
    },
    {
      type: 'bulletList',
      content: suggestedViewFieldGroups.map(({ viewId, viewName, fields }) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: viewName, marks: [{ type: 'bold' }] },
              {
                type: 'text',
                text: `: ${fields.map(({ label }) => label).join(', ')} `,
              },
              // The hidden INDEX view shares the initial view's name, so the id disambiguates.
              { type: 'text', text: viewId, marks: [{ type: 'code' }] },
            ],
          },
        ],
      })),
    },
  ],
});
