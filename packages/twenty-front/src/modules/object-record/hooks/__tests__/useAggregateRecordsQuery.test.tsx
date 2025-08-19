import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregateRecordsQuery } from '@/object-record/hooks/useAggregateRecordsQuery';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { renderHook } from '@testing-library/react';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/utils/generateAggregateQuery');

const fields = [
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
];

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
  fields,
  readableFields: fields,
  updatableFields: fields,
  indexMetadatas: [],
  isLabelSyncedWithName: true,
  isRemote: false,
  isSystem: false,
  isUIReadOnly: false,
};

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

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
    const { result } = renderHook(
      () =>
        useAggregateRecordsQuery({
          objectNameSingular: 'company',
          recordGqlFieldsAggregate: {
            name: [AggregateOperations.COUNT],
          },
        }),
      { wrapper: Wrapper },
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
    const { result } = renderHook(
      () =>
        useAggregateRecordsQuery({
          objectNameSingular: 'company',
          recordGqlFieldsAggregate: {
            amount: [AggregateOperations.SUM],
          },
        }),
      { wrapper: Wrapper },
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

  it('should early return for invalid aggregation operation', () => {
    const { result } = renderHook(
      () =>
        useAggregateRecordsQuery({
          objectNameSingular: 'company',
          recordGqlFieldsAggregate: {
            name: [AggregateOperations.SUM],
          },
        }),
      { wrapper: Wrapper },
    );

    expect(result.current.gqlFieldToFieldMap).toEqual({});
  });

  it('should handle multiple aggregations', () => {
    const { result } = renderHook(
      () =>
        useAggregateRecordsQuery({
          objectNameSingular: 'company',
          recordGqlFieldsAggregate: {
            amount: [AggregateOperations.SUM],
            name: [AggregateOperations.COUNT],
          },
        }),
      { wrapper: Wrapper },
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
