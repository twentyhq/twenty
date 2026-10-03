import { useExportProcessRecordsForCSV } from '@/object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { generateCsv } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: jest.fn(() => ({
    objectMetadataItem: {
      fields: [
        { type: FieldMetadataType.CURRENCY, name: 'price' },
        { type: FieldMetadataType.TEXT, name: 'name' },
        { type: FieldMetadataType.MULTI_SELECT, name: 'tags' },
        { type: FieldMetadataType.ARRAY, name: 'skills' },
      ],
    },
  })),
}));

describe('useExportProcessRecordsForCSV', () => {
  it('processes records with currency fields correctly', () => {
    const { result } = renderHook(() =>
      useExportProcessRecordsForCSV('someObject'),
    );

    const records = [
      {
        __typename: 'ObjectRecord',
        id: '1',
        price: { amountMicros: 123456, currencyCode: 'USD' },
        name: 'Item 1',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        price: { amountMicros: 789012, currencyCode: 'EUR' },
        name: 'Item 2',
      },
    ];

    let processedRecords;

    act(() => {
      processedRecords = result.current.processRecordsForCSVExport(records);
    });

    expect(processedRecords).toEqual([
      {
        __typename: 'ObjectRecord',
        id: '1',
        price: { amountMicros: 0.123456, currencyCode: 'USD' },
        name: 'Item 1',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        price: { amountMicros: 0.789012, currencyCode: 'EUR' },
        name: 'Item 2',
      },
    ]);
  });

  it('processes records with multi-select and array fields correctly', () => {
    const { result } = renderHook(() =>
      useExportProcessRecordsForCSV('someObject'),
    );

    const records = [
      {
        __typename: 'ObjectRecord',
        id: '1',
        tags: ['TAG1', 'TAG2'],
        skills: ['skill1', 'skill2', 'skill3'],
        name: 'Item 1',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        tags: ['TAG3'],
        skills: ['skill4'],
        name: 'Item 2',
      },
    ];

    let processedRecords;

    act(() => {
      processedRecords = result.current.processRecordsForCSVExport(records);
    });

    expect(processedRecords).toEqual([
      {
        __typename: 'ObjectRecord',
        id: '1',
        tags: '["TAG1","TAG2"]',
        skills: '["skill1","skill2","skill3"]',
        name: 'Item 1',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        tags: '["TAG3"]',
        skills: '["skill4"]',
        name: 'Item 2',
      },
    ]);
  });

  it('processes records with empty multi-select and array fields correctly', () => {
    const { result } = renderHook(() =>
      useExportProcessRecordsForCSV('someObject'),
    );

    const records = [
      {
        __typename: 'ObjectRecord',
        id: '1',
        tags: [],
        skills: [],
        name: 'Item 1',
      },
    ];

    let processedRecords;

    act(() => {
      processedRecords = result.current.processRecordsForCSVExport(records);
    });

    expect(processedRecords).toEqual([
      {
        __typename: 'ObjectRecord',
        id: '1',
        tags: '[]',
        skills: '[]',
        name: 'Item 1',
      },
    ]);
  });

  it('preserves null or undefined amountMicros for currency fields instead of converting to 0', () => {
    const { result } = renderHook(() =>
      useExportProcessRecordsForCSV('someObject'),
    );

    const records = [
      {
        __typename: 'ObjectRecord',
        id: '1',
        price: { amountMicros: null, currencyCode: 'USD' },
        name: 'Empty amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        price: { amountMicros: undefined, currencyCode: 'EUR' },
        name: 'Undefined amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '3',
        price: { amountMicros: 0, currencyCode: 'GBP' },
        name: 'Zero amount',
      },
    ];

    let processedRecords;

    act(() => {
      processedRecords = result.current.processRecordsForCSVExport(records);
    });

    expect(processedRecords).toEqual([
      {
        __typename: 'ObjectRecord',
        id: '1',
        price: { amountMicros: null, currencyCode: 'USD' },
        name: 'Empty amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        price: { amountMicros: null, currencyCode: 'EUR' },
        name: 'Undefined amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '3',
        price: { amountMicros: 0, currencyCode: 'GBP' },
        name: 'Zero amount',
      },
    ]);
  });

  it('writes an empty amount cell in the CSV when the currency amount is null or undefined', () => {
    const { result } = renderHook(() =>
      useExportProcessRecordsForCSV('someObject'),
    );

    const columns: Pick<
      ColumnDefinition<FieldMetadata>,
      'size' | 'label' | 'type' | 'metadata'
    >[] = [
      {
        label: 'Price',
        size: 100,
        type: FieldMetadataType.CURRENCY,
        metadata: { fieldName: 'price' },
      },
    ];

    const records = [
      {
        __typename: 'ObjectRecord',
        id: '1',
        price: { amountMicros: null, currencyCode: 'USD' },
        name: 'No amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '2',
        price: { amountMicros: 123456000, currencyCode: 'EUR' },
        name: 'Has amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '3',
        price: { amountMicros: undefined, currencyCode: 'GBP' },
        name: 'Missing amount',
      },
      {
        __typename: 'ObjectRecord',
        id: '4',
        price: { amountMicros: 0, currencyCode: 'CAD' },
        name: 'Zero amount',
      },
    ];

    let processedRecords: Parameters<typeof generateCsv>[0]['rows'] = [];

    act(() => {
      processedRecords = result.current.processRecordsForCSVExport(records);
    });

    const csv = generateCsv({ columns, rows: processedRecords });

    expect(csv).toContain('Price / Amount');
    expect(csv).toContain('Price / Currency');
    expect(csv).toContain('1,,USD');
    expect(csv).toContain('2,123.456,EUR');
    expect(csv).toContain('3,,GBP');
    expect(csv).toContain('4,0,CAD');
    expect(csv).not.toContain('1,0,USD');
    expect(csv).not.toContain('3,0,GBP');
  });
});
