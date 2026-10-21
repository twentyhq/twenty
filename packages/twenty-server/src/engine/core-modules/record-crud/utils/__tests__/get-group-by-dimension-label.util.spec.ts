import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { getGroupByDimensionLabel } from 'src/engine/core-modules/record-crud/utils/get-group-by-dimension-label.util';

describe('getGroupByDimensionLabel', () => {
  const cases: Array<{
    entry: ObjectRecordGroupBy[number];
    expected: string;
  }> = [
    { entry: { tags: true }, expected: 'tags' },
    { entry: { tags: { unnest: true } }, expected: 'tags' },
    { entry: { aliases: { unnest: true } }, expected: 'aliases' },
    { entry: { name: true }, expected: 'name' },
    { entry: { name: { firstName: true } }, expected: 'name.firstName' },
    { entry: { companyId: true }, expected: 'companyId' },
    { entry: { companyId: { id: true } }, expected: 'companyId' },
    {
      entry: {
        createdAt: {
          granularity: ObjectRecordGroupByDateGranularity.MONTH,
          timeZone: 'UTC',
        },
      },
      expected: 'createdAt',
    },
  ];

  it.each(cases)('labels $entry as $expected', ({ entry, expected }) => {
    expect(getGroupByDimensionLabel(entry)).toBe(expected);
  });
});
