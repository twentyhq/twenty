import { EachTestingContext } from 'twenty-shared/testing';

import { OPPORTUNITY_WITH_FIELDS_MAPS } from 'src/engine/api/rest/core/query-builder/utils/__tests__/mocks/opportunity-field-maps.mock';
import { checkFields } from 'src/engine/api/rest/core/query-builder/utils/check-fields.utils';

describe('checkFields', () => {
  const testCases: EachTestingContext<{
    fields: string[];
    shouldThrow?: boolean;
  }>[] = [
    {
      title: 'should accept valid join column id',
      context: {
        fields: ['pointOfContactId'],
      },
    },
    {
      title: 'should accept valid relation field name',
      context: {
        shouldThrow: true,
        fields: ['pointOfContact'],
      },
    },
    {
      title: 'should accept valid field name',
      context: {
        fields: ['position'],
      },
    },
    {
      title: 'should reject invalid field name',
      context: {
        fields: ['wrongField'],
        shouldThrow: true,
      },
    },
    {
      title: 'should reject mix of valid and invalid field names',
      context: {
        fields: ['position', 'wrongField'],
        shouldThrow: true,
      },
    },
    {
      title: 'should accept composite field',
      context: {
        // I don't understand how this could work in the graphql API
        // This doesnot need to be formatted as field.subField ?
        fields: ['source'],
      },
    },
  ];

  it.each(testCases)('$title', ({ context }) => {
    if (context.shouldThrow) {
      expect(() =>
        checkFields(OPPORTUNITY_WITH_FIELDS_MAPS, context.fields),
      ).toThrowErrorMatchingSnapshot();
    } else {
      expect(() =>
        checkFields(OPPORTUNITY_WITH_FIELDS_MAPS, context.fields),
      ).not.toThrow();
    }
  });
});
