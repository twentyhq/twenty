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

  const createFilter = (
    id: string,
    fieldMetadataId: string,
    value: string,
    operand: ViewFilterOperand,
    groupId?: string,
    position = 0,
  ): RecordFilter =>
    ({
      id,
      fieldMetadataId,
      value,
      operand,
      recordFilterGroupId: groupId,
      positionInRecordFilterGroup: position,
    }) as RecordFilter;

  const createGroup = (
    id: string,
    operator: RecordFilterGroupLogicalOperator,
    parentId?: string,
    position = 0,
  ): RecordFilterGroup => ({
    id,
    logicalOperator: operator,
    parentRecordFilterGroupId: parentId,
    positionInRecordFilterGroup: position,
  });

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

  describe('Basic cases', () => {
    it('should return null when group not found', () => {
      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'non-existent',
        allRecordFilters: [],
        allRecordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toBeNull();
    });

    it('should serialize empty group with operator only', () => {
      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.AND),
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
      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.AND),
      ];
      const filters = [
        createFilter(
          'filter-1',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'group-1',
        ),
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
      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.OR),
      ];
      const filters = [
        createFilter(
          'filter-1',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'group-1',
          0,
        ),
        createFilter(
          'filter-2',
          'field-2',
          'Acme',
          ViewFilterOperand.CONTAINS,
          'group-1',
          1,
        ),
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
          { field: 'status', op: ViewFilterOperand.IS, value: 'OPEN' },
          { field: 'name', op: ViewFilterOperand.CONTAINS, value: 'Acme' },
        ],
      });
    });
  });

  describe('Position-based sorting', () => {
    it('should sort filters by position', () => {
      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.AND),
      ];
      const filters = [
        createFilter(
          'filter-2',
          'field-2',
          'Acme',
          ViewFilterOperand.CONTAINS,
          'group-1',
          2,
        ),
        createFilter(
          'filter-1',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'group-1',
          0,
        ),
        createFilter(
          'filter-3',
          'field-3',
          '1000',
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          'group-1',
          1,
        ),
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.filters?.map((f) => f.field)).toEqual([
        'status',
        'amount',
        'name',
      ]);
    });

    it('should sort child groups by position', () => {
      const groups = [
        createGroup('parent', RecordFilterGroupLogicalOperator.AND),
        createGroup(
          'child-2',
          RecordFilterGroupLogicalOperator.OR,
          'parent',
          2,
        ),
        createGroup(
          'child-1',
          RecordFilterGroupLogicalOperator.AND,
          'parent',
          1,
        ),
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'parent',
        allRecordFilters: [],
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.groups?.map((g) => g.operator)).toEqual([
        RecordFilterGroupLogicalOperator.AND,
        RecordFilterGroupLogicalOperator.OR,
      ]);
    });
  });

  describe('Nested groups', () => {
    it('should handle one level of nesting', () => {
      const groups = [
        createGroup('parent', RecordFilterGroupLogicalOperator.AND),
        createGroup('child', RecordFilterGroupLogicalOperator.OR, 'parent'),
      ];
      const filters = [
        createFilter(
          'filter-parent',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'parent',
        ),
        createFilter(
          'filter-child',
          'field-2',
          'Acme',
          ViewFilterOperand.CONTAINS,
          'child',
        ),
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'parent',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result).toEqual({
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [{ field: 'status', op: ViewFilterOperand.IS, value: 'OPEN' }],
        groups: [
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            filters: [
              { field: 'name', op: ViewFilterOperand.CONTAINS, value: 'Acme' },
            ],
          },
        ],
      });
    });

    it('should handle deep nesting (3 levels)', () => {
      const groups = [
        createGroup('level-1', RecordFilterGroupLogicalOperator.AND),
        createGroup('level-2', RecordFilterGroupLogicalOperator.OR, 'level-1'),
        createGroup('level-3', RecordFilterGroupLogicalOperator.AND, 'level-2'),
      ];
      const filters = [
        createFilter(
          'filter-3',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'level-3',
        ),
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
                  { field: 'status', op: ViewFilterOperand.IS, value: 'OPEN' },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should handle multiple sibling child groups', () => {
      const groups = [
        createGroup('parent', RecordFilterGroupLogicalOperator.AND),
        createGroup('child-1', RecordFilterGroupLogicalOperator.OR, 'parent'),
        createGroup('child-2', RecordFilterGroupLogicalOperator.AND, 'parent'),
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'parent',
        allRecordFilters: [],
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.groups).toHaveLength(2);
      expect(result?.groups?.map((g) => g.operator)).toEqual([
        RecordFilterGroupLogicalOperator.OR,
        RecordFilterGroupLogicalOperator.AND,
      ]);
    });
  });

  describe('Filter validation', () => {
    it('should filter out invalid filters that return null', () => {
      mockConvertRecordFilterToUrlFilter.mockImplementation(
        ({ recordFilter }) => {
          if (recordFilter.id === 'filter-2') return null;
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

      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.AND),
      ];
      const filters = [
        createFilter(
          'filter-1',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'group-1',
        ),
        createFilter(
          'filter-2',
          'invalid',
          'value',
          ViewFilterOperand.IS,
          'group-1',
        ),
        createFilter(
          'filter-3',
          'field-3',
          '1000',
          ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          'group-1',
        ),
      ];

      const result = mapRecordFilterGroupToUrlFilterGroup({
        recordFilterGroupId: 'group-1',
        allRecordFilters: filters,
        allRecordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.filters).toHaveLength(2);
      expect(result?.filters?.map((f) => f.field)).toEqual([
        'status',
        'amount',
      ]);
    });

    it('should omit filters array when all filtered out', () => {
      mockConvertRecordFilterToUrlFilter.mockReturnValue(null);

      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.AND),
      ];
      const filters = [
        createFilter(
          'filter-1',
          'bad',
          'OPEN',
          ViewFilterOperand.IS,
          'group-1',
        ),
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
    it('should only include filters from the specified group', () => {
      const groups = [
        createGroup('group-1', RecordFilterGroupLogicalOperator.AND),
        createGroup('group-2', RecordFilterGroupLogicalOperator.OR),
      ];
      const filters = [
        createFilter(
          'filter-1',
          'field-1',
          'OPEN',
          ViewFilterOperand.IS,
          'group-1',
        ),
        createFilter(
          'filter-2',
          'field-2',
          'Acme',
          ViewFilterOperand.CONTAINS,
          'group-2',
        ),
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
