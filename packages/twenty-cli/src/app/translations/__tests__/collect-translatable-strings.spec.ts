import { type Manifest } from 'twenty-shared/application';
import { describe, expect, it } from 'vitest';

import { collectTranslatableStrings } from '@/app/translations/collect-translatable-strings';

describe('collectTranslatableStrings', () => {
  it('collects select and multi-select option labels as field labels', () => {
    const manifest = {
      application: {},
      objects: [
        {
          labelSingular: 'Budget',
          labelPlural: 'Budgets',
          fields: [
            {
              type: 'SELECT',
              label: 'Period',
              options: [{ value: 'WEEK', label: 'Week' }],
            },
          ],
        },
      ],
      fields: [
        {
          type: 'MULTI_SELECT',
          label: 'Roles',
          options: [{ value: 'BUYER', label: 'Buyer' }],
        },
        {
          type: 'RATING',
          label: 'Score',
          options: [{ value: 'RATING_1', label: '1' }],
        },
      ],
    } as unknown as Manifest;

    const descriptors = collectTranslatableStrings(manifest);

    expect(descriptors).toEqual(
      expect.arrayContaining([
        { message: 'Week', context: 'fieldMetadata.label' },
        { message: 'Buyer', context: 'fieldMetadata.label' },
      ]),
    );
    expect(descriptors).not.toContainEqual({
      message: '1',
      context: 'fieldMetadata.label',
    });
  });
});
