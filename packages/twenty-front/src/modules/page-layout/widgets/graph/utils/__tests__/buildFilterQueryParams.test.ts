import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { mapRecordFilterToUrlFilter } from '@/page-layout/widgets/graph/utils/mapRecordFilterToUrlFilter';
import { mapRecordFilterGroupToUrlFilterGroup } from '@/page-layout/widgets/graph/utils/mapRecordFilterGroupToUrlFilterGroup';
import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

jest.mock('@/page-layout/widgets/graph/utils/mapRecordFilterToUrlFilter');
jest.mock(
  '@/page-layout/widgets/graph/utils/mapRecordFilterGroupToUrlFilterGroup',
);

const mockConvertRecordFilterToUrlFilter =
  mapRecordFilterToUrlFilter as jest.MockedFunction<
    typeof mapRecordFilterToUrlFilter
  >;
const mockSerializeRecordFilterGroupToUrl =
  mapRecordFilterGroupToUrlFilterGroup as jest.MockedFunction<
    typeof mapRecordFilterGroupToUrlFilterGroup
  >;

describe('buildFilterQueryParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('With root group (filterGroup mode)', () => {
    it('should build filterGroup params with operator only', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
        operator: RecordFilterGroupLogicalOperator.AND,
      });

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filterGroup[operator]')).toBe('AND');
      expect(result.toString()).toBe('filterGroup%5Boperator%5D=AND');
    });

    it('should build filterGroup params with filters', () => {
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

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
        ],
      });

      const result = buildFilterQueryParams({
        recordFilters: filters,
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filterGroup[operator]')).toBe('AND');
      expect(result.get('filterGroup[filters][0][field]')).toBe('status');
      expect(result.get('filterGroup[filters][0][op]')).toBe('IS');
      expect(result.get('filterGroup[filters][0][value]')).toBe('OPEN');
    });

    it('should build filterGroup params with filter including subField', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'createdAt',
            op: ViewFilterOperand.IS_AFTER,
            value: '2024-01-01',
            subField: 'date',
          },
        ],
      });

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filterGroup[filters][0][field]')).toBe('createdAt');
      expect(result.get('filterGroup[filters][0][subField]')).toBe('date');
    });

    it('should build filterGroup params with one level of nested groups', () => {
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

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
        operator: RecordFilterGroupLogicalOperator.AND,
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

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filterGroup[operator]')).toBe('AND');
      expect(result.get('filterGroup[groups][0][operator]')).toBe('OR');
      expect(result.get('filterGroup[groups][0][filters][0][field]')).toBe(
        'name',
      );
      expect(result.get('filterGroup[groups][0][filters][0][op]')).toBe(
        'CONTAINS',
      );
      expect(result.get('filterGroup[groups][0][filters][0][value]')).toBe(
        'Acme',
      );
    });

    it('should build filterGroup params with deeply nested groups', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'level-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
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

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filterGroup[operator]')).toBe('AND');
      expect(result.get('filterGroup[groups][0][operator]')).toBe('OR');
      expect(result.get('filterGroup[groups][0][groups][0][operator]')).toBe(
        'AND',
      );
      expect(
        result.get('filterGroup[groups][0][groups][0][filters][0][field]'),
      ).toBe('status');
    });

    it('should handle mixed filters and groups in root', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-parent',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
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

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      // Root filter
      expect(result.get('filterGroup[filters][0][field]')).toBe('status');

      // Nested group and filter
      expect(result.get('filterGroup[groups][0][operator]')).toBe('OR');
      expect(result.get('filterGroup[groups][0][filters][0][field]')).toBe(
        'name',
      );
    });

    it('should handle multiple sibling groups', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'parent',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      mockSerializeRecordFilterGroupToUrl.mockReturnValue({
        operator: RecordFilterGroupLogicalOperator.AND,
        groups: [
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            filters: [
              { field: 'status', op: ViewFilterOperand.IS, value: 'OPEN' },
            ],
          },
          {
            operator: RecordFilterGroupLogicalOperator.AND,
            filters: [
              { field: 'name', op: ViewFilterOperand.CONTAINS, value: 'Corp' },
            ],
          },
        ],
      });

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filterGroup[groups][0][operator]')).toBe('OR');
      expect(result.get('filterGroup[groups][1][operator]')).toBe('AND');
      expect(result.get('filterGroup[groups][0][filters][0][field]')).toBe(
        'status',
      );
      expect(result.get('filterGroup[groups][1][filters][0][field]')).toBe(
        'name',
      );
    });
  });

  describe('Without root group (flat filter mode)', () => {
    it('should build flat filter params for single parentless filter', () => {
      mockConvertRecordFilterToUrlFilter.mockReturnValue({
        field: 'status',
        op: ViewFilterOperand.IS,
        value: 'OPEN',
      });

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = buildFilterQueryParams({
        recordFilters: filters,
        recordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filter[status][IS]')).toBe('OPEN');
    });

    it('should build flat filter params with subField', () => {
      mockConvertRecordFilterToUrlFilter.mockReturnValue({
        field: 'createdAt',
        op: ViewFilterOperand.IS_AFTER,
        value: '2024-01-01',
        subField: 'date',
      });

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: '2024-01-01',
          operand: ViewFilterOperand.IS_AFTER,
          subFieldName: 'date',
          positionInRecordFilterGroup: 0,
          displayValue: '2024-01-01',
          type: FieldMetadataType.SELECT,
          label: 'Status',
        } as unknown as RecordFilter,
      ];

      const result = buildFilterQueryParams({
        recordFilters: filters,
        recordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filter[createdAt.date][IS_AFTER]')).toBe('2024-01-01');
    });

    it('should skip filters that mapRecordFilterToUrlFilter returns null for', () => {
      mockConvertRecordFilterToUrlFilter
        .mockReturnValueOnce({
          field: 'status',
          op: ViewFilterOperand.IS,
          value: 'OPEN',
        })
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({
          field: 'name',
          op: ViewFilterOperand.CONTAINS,
          value: 'Acme',
        });

      const filters: RecordFilter[] = [
        {
          id: 'filter-1',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-2',
          fieldMetadataId: 'bad-field',
          value: 'value',
          operand: ViewFilterOperand.IS,
          positionInRecordFilterGroup: 1,
        } as RecordFilter,
        {
          id: 'filter-3',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          positionInRecordFilterGroup: 2,
        } as RecordFilter,
      ];

      const result = buildFilterQueryParams({
        recordFilters: filters,
        recordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.get('filter[status][IS]')).toBe('OPEN');
      expect(result.get('filter[name][CONTAINS]')).toBe('Acme');
      expect(result.toString()).not.toContain('bad-field');
    });

    it('should only process parentless filters in flat mode', () => {
      mockConvertRecordFilterToUrlFilter.mockReturnValue({
        field: 'status',
        op: ViewFilterOperand.IS,
        value: 'OPEN',
      });

      const filters: RecordFilter[] = [
        {
          id: 'filter-parentless',
          fieldMetadataId: 'field-1',
          value: 'OPEN',
          operand: ViewFilterOperand.IS,
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
        {
          id: 'filter-with-group',
          fieldMetadataId: 'field-2',
          value: 'Acme',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'some-group',
          positionInRecordFilterGroup: 0,
        } as RecordFilter,
      ];

      const result = buildFilterQueryParams({
        recordFilters: filters,
        recordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      // Only parentless filter should be in params
      expect(mockConvertRecordFilterToUrlFilter).toHaveBeenCalledTimes(1);
      expect(result.get('filter[status][IS]')).toBe('OPEN');
    });
  });

  describe('Empty cases', () => {
    it('should return empty URLSearchParams when no filters or groups', () => {
      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: [],
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.toString()).toBe('');
    });

    it('should return empty URLSearchParams when mapRecordFilterGroupToUrlFilterGroup returns null', () => {
      const groups: RecordFilterGroup[] = [
        {
          id: 'group-1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          positionInRecordFilterGroup: 0,
        },
      ];

      mockSerializeRecordFilterGroupToUrl.mockReturnValue(null);

      const result = buildFilterQueryParams({
        recordFilters: [],
        recordFilterGroups: groups,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.toString()).toBe('');
    });

    it('should handle defaults when recordFilters and recordFilterGroups are undefined', () => {
      const result = buildFilterQueryParams({
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.toString()).toBe('');
    });
  });
});
