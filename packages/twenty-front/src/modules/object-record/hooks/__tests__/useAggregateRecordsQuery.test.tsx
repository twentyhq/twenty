import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregateRecordsQuery } from '@/object-record/hooks/useAggregateRecordsQuery';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
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
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fields: [
    {
      id: 'field-1',
      name: 'amount',
      label: 'Amount',
      type: FieldMetadataType.Number,
      isCustom: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FieldMetadataItem,
    {
      id: 'field-2',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.Text,
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
          name: [AGGREGATE_OPERATIONS.count],
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
          amount: [AGGREGATE_OPERATIONS.sum],
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
            name: [AGGREGATE_OPERATIONS.sum],
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
          amount: [AGGREGATE_OPERATIONS.sum],
          name: [AGGREGATE_OPERATIONS.count],
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
