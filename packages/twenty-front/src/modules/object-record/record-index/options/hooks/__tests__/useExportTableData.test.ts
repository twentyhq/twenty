import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { RelationDefinitionType } from '~/generated-metadata/graphql';
import {
  csvDownloader,
  displayedExportProgress,
  download,
  generateCsv,
} from '../useExportTableData';

jest.useFakeTimers();

describe('download', () => {
  it('creates a download link and clicks it', () => {
    const link = document.createElement('a');
    document.createElement = jest.fn().mockReturnValue(link);
    const appendChild = jest.spyOn(document.body, 'appendChild');
    const click = jest.spyOn(link, 'click');

    URL.createObjectURL = jest.fn().mockReturnValue('fake-url');
    download(new Blob(['test'], { type: 'text/plain' }), 'test.txt');

    expect(appendChild).toHaveBeenCalledWith(link);
    expect(link.href).toEqual('http://localhost/fake-url');
    expect(link.getAttribute('download')).toEqual('test.txt');
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe('generateCsv', () => {
  it('generates a csv with formatted headers', async () => {
    const columns = [
      { label: 'Foo', metadata: { fieldName: 'foo' } },
      { label: 'Empty', metadata: { fieldName: 'empty' } },
      { label: 'Nested', metadata: { fieldName: 'nested' } },
      {
        label: 'Relation',
        metadata: {
          fieldName: 'relation',
          relationType: RelationDefinitionType.ManyToOne,
        },
      },
    ] as ColumnDefinition<FieldMetadata>[];
    const rows = [
      {
        id: '1',
        bar: 'another field',
        empty: null,
        foo: 'some field',
        nested: { __typename: 'type', foo: 'foo', nested: 'nested' },
        relation: 'a relation',
      },
    ];
    const csv = generateCsv({ columns, rows });
    expect(csv).toEqual(`Id,Foo,Empty,Nested Foo,Nested Nested,Relation
1,some field,,foo,nested,a relation`);
  });
});

describe('csvDownloader', () => {
  it('downloads a csv', () => {
    const filename = 'test.csv';
    const data = {
      rows: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Alice' },
      ],
      columns: [],
      objectNameSingular: '',
    };

    const link = document.createElement('a');
    document.createElement = jest.fn().mockReturnValue(link);
    const createObjectURL = jest.spyOn(URL, 'createObjectURL');

    csvDownloader(filename, data);

    expect(link.getAttribute('download')).toEqual('test.csv');
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text/csv' }),
    );
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
