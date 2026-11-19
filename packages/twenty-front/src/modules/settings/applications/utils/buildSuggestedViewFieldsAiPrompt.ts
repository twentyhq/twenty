import { t } from '@lingui/core/macro';
import { type JSONContent } from '@tiptap/core';

import { type SuggestedViewFieldGroup } from '@/settings/applications/utils/computeSuggestedViewFieldGroups';

const buildParagraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

// The chat composer only supports paragraphs and text, so each line is its own paragraph.
export const buildSuggestedViewFieldsAiPrompt = ({
  applicationName,
  suggestedViewFieldGroups,
}: {
  applicationName: string;
  suggestedViewFieldGroups: SuggestedViewFieldGroup[];
}): JSONContent => ({
  type: 'doc',
  content: [
    buildParagraph(
      t`Add these ${applicationName} columns at the end of my views:`,
    ),
    ...suggestedViewFieldGroups.map(({ viewId, viewName, fields }) => {
      const fieldLabels = fields.map(({ label }) => label).join(', ');

      // The hidden INDEX view shares the initial view's name, so the id disambiguates.
      return buildParagraph(
        `• ${t`${viewName}: ${fieldLabels} (view ${viewId})`}`,
      );
    }),
  ],
});
