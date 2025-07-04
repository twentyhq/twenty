import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import {
  displayedExportProgress,
  generateCsv,
} from '../useRecordIndexExportRecords';

jest.useFakeTimers();

describe('generateCsv', () => {
  it('generates a csv with formatted headers', async () => {
    const columns = [
      { label: 'Foo', metadata: { fieldName: 'foo' } },
      { label: 'Empty', metadata: { fieldName: 'empty' } },
      {
        label: 'Nested link field',
        type: FieldMetadataType.LINKS,
        metadata: { fieldName: 'nestedLinkField' },
      },
      {
        label: 'Relation',
        metadata: {
          fieldName: 'relation',
          relationType: RelationType.MANY_TO_ONE,
        },
      },
    ] as ColumnDefinition<FieldMetadata>[];
    const rows = [
      {
        id: '1',
        bar: 'another field',
        empty: null,
        foo: 'some field',
        nestedLinkField: {
          __typename: 'Links',
          primaryLinkUrl: 'https://www.test.com',
          secondaryLinks: [
            { label: 'secondary link 1', url: 'https://www.test.com' },
            { label: 'secondary link 2', url: 'https://www.test.com' },
          ],
        },
        relation: 'a relation',
      },
    ];
    const csv = generateCsv({ columns, rows });
    expect(csv)
      .toEqual(`Id,Foo,Empty,Nested link field / Link URL,Nested link field / Secondary Links,Relation
1,some field,,https://www.test.com,"[{""label"":""secondary link 1"",""url"":""https://www.test.com""},{""label"":""secondary link 2"",""url"":""https://www.test.com""}]",a relation`);
  });
});

describe('displayedExportProgress', () => {
  it.each([
    [undefined, undefined, 'percentage', 'Export'],
    [20, 50, 'percentage', 'Export (40%)'],
    [0, 100, 'number', 'Export (0)'],
    [10, 10, 'percentage', 'Export (100%)'],
    [10, 10, 'number', 'Export (10)'],
    [7, 9, 'percentage', 'Export (78%)'],
  ])(
    'displays the export progress',
    (exportedRecordCount, totalRecordCount, displayType, expected) => {
      expect(
        displayedExportProgress({
          exportedRecordCount,
          totalRecordCount,
          displayType: displayType as 'percentage' | 'number',
        }),
      ).toEqual(expected);
    },
  );
});
