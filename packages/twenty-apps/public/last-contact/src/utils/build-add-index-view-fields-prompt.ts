import { t } from 'twenty-sdk/front-component';

import { type IndexViewFields } from 'src/constants/index-view-fields';

export const buildAddIndexViewFieldsPrompt = (
  missingIndexViewFields: IndexViewFields[],
): string =>
  [
    t(
      'Add the following fields to these views and make them visible. Skip a view that does not exist, and leave its other columns as they are.',
    ),
    ...missingIndexViewFields.map(({ objectLabelPlural, fields }) =>
      [
        `- ${t('All {objectLabelPlural} view', { objectLabelPlural })}`,
        ...fields.map(({ label, name }) => `  - ${label} (${name})`),
      ].join('\n'),
    ),
  ].join('\n\n');
