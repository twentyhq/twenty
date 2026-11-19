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
    ...suggestedViewFieldGroups.map(({ viewName, fields }) =>
      buildParagraph(
        `• ${viewName}: ${fields.map(({ label }) => label).join(', ')}`,
      ),
    ),
  ],
});
