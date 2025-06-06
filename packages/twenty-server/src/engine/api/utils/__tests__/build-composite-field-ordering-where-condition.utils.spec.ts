import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCompositeFieldWhereCondition } from 'src/engine/api/utils/build-composite-field-where-condition.utils';

describe('buildCompositeFieldWhereCondition', () => {
  describe('empty properties', () => {
    it('should return empty object when compositeFieldProperties is empty', () => {
      const result = buildCompositeFieldWhereCondition({
        fieldType: FieldMetadataType.TEXT,
        fieldKey: 'person',
        orderBy: [],
        cursorValue: { name: 'John' },
        isForwardPagination: true,
      });

      expect(result).toEqual({});
    });
  });

  describe('single property cases', () => {
    const singlePropertyTestCases: EachTestingContext<{
      description: string;
      fieldType: FieldMetadataType;
      fieldKey: string;
      orderBy: ObjectRecordOrderBy;
      value: { [key: string]: any };
      isForwardPagination: boolean;
      operator?: string;
      expectedOperator: string;
    }>[] = [
      {
        title: 'ascending order with forward pagination',
        context: {
          description: 'ascending order with forward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [{ person: { firstName: OrderByDirection.AscNullsLast } }],
          value: { firstName: 'John' },
          isForwardPagination: true,
          operator: undefined,
          expectedOperator: 'gt',
        },
      },
      {
        title: 'ascending order with backward pagination',
        context: {
          description: 'ascending order with backward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [{ person: { firstName: OrderByDirection.AscNullsLast } }],
          value: { firstName: 'John' },
          isForwardPagination: false,
          operator: undefined,
          expectedOperator: 'lt',
        },
      },
      {
        title: 'descending order with forward pagination',
        context: {
          description: 'descending order with forward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [{ person: { firstName: OrderByDirection.DescNullsLast } }],
          value: { firstName: 'John' },
          isForwardPagination: true,
          operator: undefined,
          expectedOperator: 'lt',
        },
      },
      {
        title: 'descending order with backward pagination',
        context: {
          description: 'descending order with backward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [{ person: { firstName: OrderByDirection.DescNullsLast } }],
          value: { firstName: 'John' },
          isForwardPagination: false,
          operator: undefined,
          expectedOperator: 'gt',
        },
      },
    ];

    test.each(singlePropertyTestCases)(
      'should handle $description',
      ({ context }) => {
        const {
          fieldType,
          fieldKey,
          orderBy,
          value,
          isForwardPagination,
          operator,
          expectedOperator,
        } = context;

        const result = buildCompositeFieldWhereCondition({
          fieldType,
          fieldKey,
          orderBy,
          cursorValue: value,
          isForwardPagination,
          operator,
        });

        expect(result).toEqual({
          [fieldKey]: {
            [fieldKey]: {
              [expectedOperator]: value[fieldKey as keyof typeof value],
            },
          },
        });
      },
    );

    test.each(singlePropertyTestCases)(
      'should match snapshot for $title',
      ({ context }) => {
        const {
          fieldType,
          fieldKey,
          orderBy,
          value,
          isForwardPagination,
          description,
        } = context;

        const result = buildCompositeFieldWhereCondition({
          fieldType,
          fieldKey,
          orderBy,
          cursorValue: value,
          isForwardPagination,
        });

        expect(result).toMatchSnapshot(`single property - ${description}`);
      },
    );
  });

  describe('multiple properties cases', () => {
    const multiplePropertiesTestCases: EachTestingContext<{
      description: string;
      fieldType: FieldMetadataType;
      fieldKey: string;
      orderBy: ObjectRecordOrderBy;
      value: { [key: string]: any };
      isForwardPagination: boolean;
    }>[] = [
      {
        title: 'two properties - both ascending, forward pagination',
        context: {
          description: 'two properties - both ascending, forward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [
            {
              person: {
                firstName: OrderByDirection.AscNullsLast,
                lastName: OrderByDirection.AscNullsLast,
              },
            },
          ],
          value: { firstName: 'John', lastName: 'Doe' },
          isForwardPagination: true,
        },
      },
      {
        title: 'two properties - both ascending, backward pagination',
        context: {
          description: 'two properties - both ascending, backward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [
            {
              person: {
                firstName: OrderByDirection.AscNullsLast,
                lastName: OrderByDirection.AscNullsLast,
              },
            },
          ],
          value: { firstName: 'John', lastName: 'Doe' },
          isForwardPagination: false,
        },
      },
      {
        title: 'two properties - mixed ordering, forward pagination',
        context: {
          description: 'two properties - mixed ordering, forward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [
            {
              person: {
                firstName: OrderByDirection.AscNullsLast,
                age: OrderByDirection.DescNullsLast,
              },
            },
          ],
          value: { firstName: 'Alice', age: 25 },
          isForwardPagination: true,
        },
      },
      {
        title: 'three properties - all ascending, forward pagination',
        context: {
          description: 'three properties - all ascending, forward pagination',
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'employee',
          orderBy: [
            {
              employee: {
                city: OrderByDirection.AscNullsLast,
                firstName: OrderByDirection.AscNullsLast,
                id: OrderByDirection.AscNullsLast,
              },
            },
          ],
          value: { city: 'New York', firstName: 'Bob', id: 'uuid-123' },
          isForwardPagination: true,
        },
      },
    ];

    test.each(multiplePropertiesTestCases)(
      'should handle $title',
      ({ context }) => {
        const { fieldType, fieldKey, orderBy, value, isForwardPagination } =
          context;
        const result = buildCompositeFieldWhereCondition({
          fieldType,
          fieldKey,
          orderBy,
          cursorValue: value,
          isForwardPagination,
        });

        expect(result).toHaveProperty('or');
        const orConditions = result.or;

        expect(Array.isArray(orConditions)).toBe(true);
        expect(orConditions).toHaveLength(orderBy.length);

        expect(orConditions[0]).toHaveProperty(fieldKey);

        for (const [index, orCondition] of orConditions.slice(1).entries()) {
          expect(orCondition).toHaveProperty('and');
          expect(Array.isArray(orCondition.and)).toBe(true);
          expect(orCondition.and).toHaveLength(index + 2);
        }
      },
    );

    test.each(multiplePropertiesTestCases)(
      'should match snapshots for $title',
      ({ context }) => {
        const {
          fieldType,
          fieldKey,
          orderBy,
          value,
          isForwardPagination,
          description,
        } = context;

        const result = buildCompositeFieldWhereCondition({
          fieldType,
          fieldKey,
          orderBy,
          cursorValue: value,
          isForwardPagination,
        });

        expect(result).toMatchSnapshot(`multiple properties - ${description}`);
      },
    );
  });
});
