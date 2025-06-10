import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregateRecordsQuery } from '@/object-record/hooks/useAggregateRecordsQuery';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { renderHook } from '@testing-library/react';
import { FieldMetadataType } from '~/generated/graphql';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/utils/generateAggregateQuery');

const mockObjectMetadataItem: ObjectMetadataItem = {
  nameSingular: 'company',
  namePlural: 'companies',
  id: 'test-id',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  isCustom: false,
  isSearchable: false,
  labelIdentifierFieldMetadataId: '20202020-dd4a-4ea4-bb7b-1c7300491b65',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fields: [
    {
      id: '20202020-fed9-4ce5-9502-02a8efaf46e1',
      name: 'amount',
      label: 'Amount',
      type: FieldMetadataType.NUMBER,
      isCustom: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FieldMetadataItem,
    {
      id: '20202020-dd4a-4ea4-bb7b-1c7300491b65',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
      isCustom: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FieldMetadataItem,
  ],
  indexMetadatas: [],
  isLabelSyncedWithName: true,
  isRemote: false,
  isSystem: false,
};

describe('useAggregateRecordsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useObjectMetadataItem as jest.Mock).mockReturnValue({
      objectMetadataItem: mockObjectMetadataItem,
    });

    (generateAggregateQuery as jest.Mock).mockReturnValue({
      loc: {
        source: {
          body: 'query AggregateCompanies($filter: CompanyFilterInput) { companies(filter: $filter) { totalCount } }',
        },
      },
    });
  });

  it('should handle simple count operation', () => {
    const { result } = renderHook(() =>
      useAggregateRecordsQuery({
        objectNameSingular: 'company',
        recordGqlFieldsAggregate: {
          name: [AggregateOperations.COUNT],
        },
      }),
    );

    expect(result.current.gqlFieldToFieldMap).toEqual({
      totalCount: ['name', 'COUNT'],
    });
    expect(generateAggregateQuery).toHaveBeenCalledWith({
      objectMetadataItem: mockObjectMetadataItem,
      recordGqlFields: {
        totalCount: true,
      },
    });
  });

  it('should handle field aggregation', () => {
    const { result } = renderHook(() =>
      useAggregateRecordsQuery({
        objectNameSingular: 'company',
        recordGqlFieldsAggregate: {
          amount: [AggregateOperations.SUM],
        },
      }),
    );

    expect(result.current.gqlFieldToFieldMap).toEqual({
      sumAmount: ['amount', 'SUM'],
    });
    expect(generateAggregateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        recordGqlFields: expect.objectContaining({
          sumAmount: true,
        }),
      }),
    );
  });

  it('should throw error for invalid aggregation operation', () => {
    expect(() =>
      renderHook(() =>
        useAggregateRecordsQuery({
          objectNameSingular: 'company',
          recordGqlFieldsAggregate: {
            name: [AggregateOperations.SUM],
          },
        }),
      ),
    ).toThrow();
  });

  it('should handle multiple aggregations', () => {
    const { result } = renderHook(() =>
      useAggregateRecordsQuery({
        objectNameSingular: 'company',
        recordGqlFieldsAggregate: {
          amount: [AggregateOperations.SUM],
          name: [AggregateOperations.COUNT],
        },
      }),
    );

    expect(result.current.gqlFieldToFieldMap).toHaveProperty('sumAmount');
    expect(generateAggregateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        recordGqlFields: expect.objectContaining({
          totalCount: true,
          sumAmount: true,
        }),
      }),
    );
  });
});
