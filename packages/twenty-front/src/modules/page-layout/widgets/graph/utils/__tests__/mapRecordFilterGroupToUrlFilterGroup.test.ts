import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { mapRecordFilterGroupToUrlFilterGroup } from '@/page-layout/widgets/graph/utils/mapRecordFilterGroupToUrlFilterGroup';
import { mapRecordFilterToUrlFilter } from '@/page-layout/widgets/graph/utils/mapRecordFilterToUrlFilter';
import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

jest.mock('@/page-layout/widgets/graph/utils/mapRecordFilterToUrlFilter');

const mockConvertRecordFilterToUrlFilter =
  mapRecordFilterToUrlFilter as jest.MockedFunction<
    typeof mapRecordFilterToUrlFilter
  >;

describe('mapRecordFilterGroupToUrlFilterGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConvertRecordFilterToUrlFilter.mockImplementation(
      ({ recordFilter, objectMetadataItem }) => {
        const field = objectMetadataItem.fields.find(
          (f) => f.id === recordFilter.fieldMetadataId,
        );
        if (!field) return null;

        return {
          field: field.name,
          op: recordFilter.operand,
          value: recordFilter.value,
        };
      },
    );
  });

  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      { id: 'field-1', name: 'status', type: FieldMetadataType.SELECT },
      { id: 'field-2', name: 'name', type: FieldMetadataType.TEXT },
      { id: 'field-3', name: 'amount', type: FieldMetadataType.NUMBER },
    ],
  } as ObjectMetadataItem;

  describe('Basic cases', () => {
    it('should return null when group ID not found', () => {
      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'non-existent-id',
        allRecordFilters: [],
        allRecordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toBeNull();
    });

    it('should serialize group with operator only (no filters or child groups)', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: [],
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.AND,
      });
    });

    it('should serialize group with single filter', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
        ],
      });
    });

    it('should serialize group with multiple filters', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-2',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 1,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.OR,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
          {
            field: 'name',
            op: ViewFilterOperand.CONTAINS,
            value: 'Acme',
          },
        ],
      });
    });
  });

  describe('Position-based sorting', () => {
    it('should sort filters by positionInRecordFilterGroup', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-2',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 2,
        } as RecordFilter,
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-3',
          fieldMetadataId: 'field-3',
          value: '1000',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 1,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.filters).toEqual([
        {
          field: 'status',
          op: ViewFilterOperand.IS,
          value: 'OPEN',
        },
        {
          field: 'amount',
          op: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1000',
        },
        {
          field: 'name',
          op: ViewFilterOperand.CONTAINS,
          value: 'Acme',
        },
      ]);
    });

    it('should sort child groups by positionInRecordFilterGroup', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-parent',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'group-child-2',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'group-parent',
          positionInRecordFilterGroup: 2,
        },
        {
          id: 'group-child-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          parentRecordFilterGroupId: 'group-parent',
          positionInRecordFilterGroup: 1,
        },
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-parent',
        allRecordFilters: [],
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.groups).toHaveLength(2);
      expect(result?.groups?.[0].operator).toBe(
        RecordFilterGroupLogicalOperator.AND,
      );
      expect(result?.groups?.[1].operator).toBe(
        RecordFilterGroupLogicalOperator.OR,
      );
    });
  });

  describe('Nested groups', () => {
    it('should recursively serialize one level of nested groups', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-parent',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'group-child',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'group-parent',
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-parent',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-parent',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-child',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group-child',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-parent',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
        ],
        groups: [
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            filters: [
              {
                field: 'name',
                op: ViewFilterOperand.CONTAINS,
                value: 'Acme',
              },
            ],
          },
        ],
      });
    });

    it('should recursively serialize deeply nested groups (3 levels)', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'level-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'level-2',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'level-1',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'level-3',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          parentRecordFilterGroupId: 'level-2',
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-level-3',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'level-3',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'level-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.AND,
        groups: [
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            groups: [
              {
                operator: RecordFilterGroupLogicalOperator.AND,
                filters: [
                  {
                    field: 'status',
                    op: ViewFilterOperand.IS,
                    value: 'OPEN',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should handle multiple sibling child groups', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'parent',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'child-1',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'parent',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'child-2',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          parentRecordFilterGroupId: 'parent',
          positionInRecordFilterGroup: 1,
        },
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'parent',
        allRecordFilters: [],
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.groups).toHaveLength(2);
      expect(result?.groups?.[0].operator).toBe(
        RecordFilterGroupLogicalOperator.OR,
      );
      expect(result?.groups?.[1].operator).toBe(
        RecordFilterGroupLogicalOperator.AND,
      );
    });
  });

  describe('Filtering out invalid filters', () => {
    it('should filter out filters that mapRecordFilterToUrlFilter returns null for', () => {
      mockConvertRecordFilterToUrlFilter.mockImplementation(
        ({ recordFilter }) => {
          if (recordFilter.id === 'filter-2') {
            return null;
          }
          const field = mockObjectMetadataItem.fields.find(
            (f) => f.id === recordFilter.fieldMetadataId,
          );
          if (!field) return null;
          return {
            field: field.name,
            op: recordFilter.operand,
            value: recordFilter.value,
          };
        },
      );

      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-2',
          fieldMetadataId: 'non-existent-field',
          value: 'value',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 1,
        } as RecordFilter,
        {
          id: 'filter-3',
          fieldMetadataId: 'field-3',
          value: '1000',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 2,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.filters).toHaveLength(2);
      expect(result?.filters?.[0].field).toBe('status');
      expect(result?.filters?.[1].field).toBe('amount');
    });

    it('should not include filters array when all filters are filtered out', () => {
      mockConvertRecordFilterToUrlFilter.mockReturnValue(null);

      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'bad-field',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.AND,
      });
      expect(result?.filters).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle filters without positionInRecordFilterGroup', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: undefined,
        } as RecordFilter,
        {
          id: 'filter-2',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: undefined,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      // Should still work, treating undefined as 0
      expect(result?.filters).toHaveLength(2);
    });

    it('should only include filters that belong to the specified group', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'group-2',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          positionInRecordFilterGroup: 1,
        },
      ];

      const filters: RecordFilter[] = [
        {
          id: 'filter-group-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          recordFilterGroupId: 'group-1',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-group-2',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group-2',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.filters).toHaveLength(1);
      expect(result?.filters?.[0].field).toBe('status');
    });
  });
});
