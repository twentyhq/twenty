import { describe, expect, it } from 'vitest';

import { buildAddIndexViewFieldsPrompt } from 'src/utils/build-add-index-view-fields-prompt';

describe('buildAddIndexViewFieldsPrompt', () => {
  it('should list one bullet per view and one sub-bullet per field', () => {
    expect(
      buildAddIndexViewFieldsPrompt([
        {
          objectUniversalIdentifier: 'person',
          objectLabelPlural: 'People',
          fields: [
            {
              universalIdentifier: 'last-contact-at',
              label: 'Last contact',
              name: 'lastContactAt',
            },
            {
              universalIdentifier: 'last-email',
              label: 'Last email',
              name: 'lastEmail',
            },
          ],
        },
        {
          objectUniversalIdentifier: 'company',
          objectLabelPlural: 'Companies',
          fields: [
            {
              universalIdentifier: 'company-last-contact-item',
              label: 'Last contact item',
              name: 'lastContactItem',
            },
          ],
        },
      ]),
    ).toBe(
      [
        'Add the following fields to these views and make them visible. Skip a view that does not exist, and leave its other columns as they are.',
        '',
        '- All People view',
        '  - Last contact (lastContactAt)',
        '  - Last email (lastEmail)',
        '',
        '- All Companies view',
        '  - Last contact item (lastContactItem)',
      ].join('\n'),
    );
  });
});
