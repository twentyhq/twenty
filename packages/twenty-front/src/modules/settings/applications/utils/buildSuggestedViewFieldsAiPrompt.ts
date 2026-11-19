import { t } from '@lingui/core/macro';

import { type SuggestedViewFieldGroup } from '@/settings/applications/utils/computeSuggestedViewFieldGroups';

export const buildSuggestedViewFieldsAiPrompt = ({
  applicationName,
  suggestedViewFieldGroups,
}: {
  applicationName: string;
  suggestedViewFieldGroups: SuggestedViewFieldGroup[];
}): string => {
  const groupLines = suggestedViewFieldGroups.map(
    ({ viewId, viewName, objectLabelPlural, fields }) => {
      const fieldList = fields
        .map(({ id, label }) => t`${label} (field ID ${id})`)
        .join(', ');

      return `- ${t`${objectLabelPlural}, view "${viewName}" (view ID ${viewId}): ${fieldList}`}`;
    },
  );

  return [
    t`${applicationName} suggests adding these fields as columns. Add each one, visible, after the existing columns of its view:`,
    '',
    ...groupLines,
  ].join('\n');
};
