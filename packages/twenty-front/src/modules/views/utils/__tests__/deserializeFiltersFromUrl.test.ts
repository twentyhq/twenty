import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapUrlFilterGroupToRecordFilterGroup } from '@/views/utils/deserializeFiltersFromUrl';
import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

describe('deserializeFiltersFromUrl', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    labelSingular: 'Opportunity',
    labelPlural: 'Opportunities',
    fields: [
      {
        id: 'field-status',
        name: 'status',
        type: FieldMetadataType.SELECT,
        label: 'Status',
      },
      {
        id: 'field-name',
        name: 'name',
        type: FieldMetadataType.TEXT,
        label: 'Name',
      },
      {
        id: 'field-amount',
        name: 'amount',
        type: FieldMetadataType.NUMBER,
        label: 'Amount',
      },
      {
        id: 'field-createdAt',
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: 'Created At',
      },
    ],
  } as ObjectMetadataItem;

  describe('mapUrlFilterGroupToRecordFilterGroup', () => {
    it('should parse a single filter in a group', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(1);
      expect(result.recordFilterGroups[0]).toMatchObject({
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 0,
      });
      expect(
        result.recordFilterGroups[0].parentRecordFilterGroupId,
      ).toBeUndefined();

      expect(result.recordFilters).toHaveLength(1);
      expect(result.recordFilters[0]).toMatchObject({
        fieldMetadataId: 'field-status',
        value: 'OPEN',
        displayValue: 'OPEN',
        type: FieldMetadataType.SELECT,
        operand: ViewFilterOperand.IS,
        label: 'Status',
        positionInRecordFilterGroup: 0,
        recordFilterGroupId: result.recordFilterGroups[0].id,
      });
    });

    it('should parse multiple filters in a group', () => {
      const urlFilterGroup = {
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
          {
            field: 'amount',
            op: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: '1000',
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(1);
      expect(result.recordFilters).toHaveLength(3);

      expect(result.recordFilters[0].positionInRecordFilterGroup).toBe(0);
      expect(result.recordFilters[1].positionInRecordFilterGroup).toBe(1);
      expect(result.recordFilters[2].positionInRecordFilterGroup).toBe(2);

      const groupId = result.recordFilterGroups[0].id;
      expect(result.recordFilters[0].recordFilterGroupId).toBe(groupId);
      expect(result.recordFilters[1].recordFilterGroupId).toBe(groupId);
      expect(result.recordFilters[2].recordFilterGroupId).toBe(groupId);
    });

    it('should parse nested groups (one level deep)', () => {
      const urlFilterGroup = {
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
              {
                field: 'amount',
                op: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
                value: '1000',
              },
            ],
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(2);
      expect(result.recordFilters).toHaveLength(3);

      // Parent group
      const parentGroup = result.recordFilterGroups[0];
      expect(parentGroup.logicalOperator).toBe(
        RecordFilterGroupLogicalOperator.AND,
      );
      expect(parentGroup.positionInRecordFilterGroup).toBe(0);
      expect(parentGroup.parentRecordFilterGroupId).toBeUndefined();

      // Child group
      const childGroup = result.recordFilterGroups[1];
      expect(childGroup.logicalOperator).toBe(
        RecordFilterGroupLogicalOperator.OR,
      );
      expect(childGroup.positionInRecordFilterGroup).toBe(1);
      expect(childGroup.parentRecordFilterGroupId).toBe(parentGroup.id);

      // Filters
      expect(result.recordFilters[0]).toMatchObject({
        fieldMetadataId: 'field-status',
        positionInRecordFilterGroup: 0,
        recordFilterGroupId: parentGroup.id,
      });

      expect(result.recordFilters[1]).toMatchObject({
        fieldMetadataId: 'field-name',
        positionInRecordFilterGroup: 0,
        recordFilterGroupId: childGroup.id,
      });

      expect(result.recordFilters[2]).toMatchObject({
        fieldMetadataId: 'field-amount',
        positionInRecordFilterGroup: 1,
        recordFilterGroupId: childGroup.id,
      });
    });

    it('should parse deeply nested groups (3 levels)', () => {
      const urlFilterGroup = {
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
            groups: [
              {
                operator: RecordFilterGroupLogicalOperator.AND,
                filters: [
                  {
                    field: 'name',
                    op: ViewFilterOperand.CONTAINS,
                    value: 'Acme',
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(3);
      expect(result.recordFilters).toHaveLength(2);

      const [level1Group, level2Group, level3Group] = result.recordFilterGroups;

      expect(level1Group.parentRecordFilterGroupId).toBeUndefined();
      expect(level1Group.logicalOperator).toBe(
        RecordFilterGroupLogicalOperator.AND,
      );

      expect(level2Group.parentRecordFilterGroupId).toBe(level1Group.id);
      expect(level2Group.logicalOperator).toBe(
        RecordFilterGroupLogicalOperator.OR,
      );

      expect(level3Group.parentRecordFilterGroupId).toBe(level2Group.id);
      expect(level3Group.logicalOperator).toBe(
        RecordFilterGroupLogicalOperator.AND,
      );
    });

    it('should handle multiple sibling groups', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        groups: [
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            filters: [
              {
                field: 'status',
                op: ViewFilterOperand.IS,
                value: 'OPEN',
              },
            ],
          },
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            filters: [
              {
                field: 'name',
                op: ViewFilterOperand.CONTAINS,
                value: 'Corp',
              },
            ],
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(3);

      const [parentGroup, childGroup1, childGroup2] = result.recordFilterGroups;

      expect(childGroup1.parentRecordFilterGroupId).toBe(parentGroup.id);
      expect(childGroup2.parentRecordFilterGroupId).toBe(parentGroup.id);

      expect(childGroup1.positionInRecordFilterGroup).toBe(0);
      expect(childGroup2.positionInRecordFilterGroup).toBe(1);
    });

    it('should handle mixed filters and groups with correct positions', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
          {
            field: 'amount',
            op: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: '500',
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
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      const parentGroup = result.recordFilterGroups[0];
      const childGroup = result.recordFilterGroups[1];

      const parentFilters = result.recordFilters.filter(
        (f) => f.recordFilterGroupId === parentGroup.id,
      );
      expect(parentFilters[0].positionInRecordFilterGroup).toBe(0);
      expect(parentFilters[1].positionInRecordFilterGroup).toBe(1);

      expect(childGroup.positionInRecordFilterGroup).toBe(2);
    });

    it('should skip filters with missing field names', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'status',
            op: ViewFilterOperand.IS,
            value: 'OPEN',
          },
          {
            field: 'nonExistentField',
            op: ViewFilterOperand.IS,
            value: 'value',
          },
          {
            field: 'name',
            op: ViewFilterOperand.CONTAINS,
            value: 'Acme',
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilters).toHaveLength(2);
      expect(result.recordFilters[0].fieldMetadataId).toBe('field-status');
      expect(result.recordFilters[1].fieldMetadataId).toBe('field-name');
    });

    it('should handle filter with subField', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [
          {
            field: 'createdAt',
            op: ViewFilterOperand.IS_AFTER,
            value: '2024-01-01',
            subField: 'date',
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilters).toHaveLength(1);
      expect(result.recordFilters[0].subFieldName).toBe('date');
    });

    it('should handle empty filters array', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        filters: [],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(1);
      expect(result.recordFilters).toHaveLength(0);
    });

    it('should handle undefined filters', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(1);
      expect(result.recordFilters).toHaveLength(0);
    });

    it('should handle empty groups array', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
        groups: [],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result.recordFilterGroups).toHaveLength(1);
      expect(result.recordFilters).toHaveLength(0);
    });

    it('should generate unique IDs for each filter and group', () => {
      const urlFilterGroup = {
        operator: RecordFilterGroupLogicalOperator.AND,
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
        groups: [
          {
            operator: RecordFilterGroupLogicalOperator.OR,
            filters: [
              {
                field: 'amount',
                op: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
                value: '1000',
              },
            ],
          },
        ],
      };

      const result = mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup,
        objectMetadataItem: mockObjectMetadataItem,
      });

      const groupIds = result.recordFilterGroups.map((g) => g.id);
      const filterIds = result.recordFilters.map((f) => f.id);
      const allIds = [...groupIds, ...filterIds];

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });
});
