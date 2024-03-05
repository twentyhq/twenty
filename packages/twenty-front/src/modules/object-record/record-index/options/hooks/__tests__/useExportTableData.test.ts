import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import {
  csvDownloader,
  download,
  generateCsv,
  percentage,
  sleep,
} from '../useExportTableData';

jest.useFakeTimers();

describe('sleep', () => {
  it('waits the provided number of milliseconds', async () => {
    const spy = jest.fn();
    sleep(1000).then(spy);

    jest.advanceTimersByTime(999);
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await Promise.resolve(); // let queued promises execute
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

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
        metadata: { fieldName: 'relation', relationType: 'TO_ONE_OBJECT' },
      },
    ] as ColumnDefinition<FieldMetadata>[];
    const rows = [
      {
        bar: 'another field',
        empty: null,
        foo: 'some field',
        nested: { __typename: 'type', foo: 'foo', nested: 'nested' },
        relation: 'a relation',
      },
    ];
    const csv = generateCsv({ columns, rows });
    expect(csv).toEqual(`Foo,Empty,Nested Foo,Nested Nested
some field,,foo,nested`);
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

describe('percentage', () => {
  it.each([
    [20, 50, 40],
    [0, 100, 0],
    [10, 10, 100],
    [10, 10, 100],
    [7, 9, 78],
  ])(
    'calculates the percentage %p/%p = %p',
    (part, whole, expectedPercentage) => {
      expect(percentage(part, whole)).toEqual(expectedPercentage);
    },
  );
});
