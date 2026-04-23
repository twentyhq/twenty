import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildCursorCompositeFieldWhereCondition } from 'src/engine/api/utils/build-cursor-composite-field-where-condition.utils';

describe('buildCompositeFieldWhereCondition', () => {
  describe('eq operator cases', () => {
    it('should handle eq operator', () => {
      const result = buildCursorCompositeFieldWhereCondition({
        fieldType: FieldMetadataType.FULL_NAME,
        fieldKey: 'name',
        orderBy: [
          {
            name: {
              firstName: OrderByDirection.AscNullsLast,
              lastName: OrderByDirection.AscNullsLast,
            },
          },
        ],
        cursorValue: { firstName: 'John', lastName: 'Doe' },
        isForwardPagination: true,
        isEqualityCondition: true,
      });

      expect(result).toEqual({
        name: {
          firstName: {
            eq: 'John',
          },
          lastName: {
            eq: 'Doe',
          },
        },
      });
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
          fieldType: FieldMetadataType.FULL_NAME,
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
          fieldType: FieldMetadataType.FULL_NAME,
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
          fieldType: FieldMetadataType.FULL_NAME,
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
          fieldType: FieldMetadataType.FULL_NAME,
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
          expectedOperator,
        } = context;

        const result = buildCursorCompositeFieldWhereCondition({
          fieldType,
          fieldKey,
          orderBy,
          cursorValue: value,
          isForwardPagination,
        });

        expect(result).toEqual({
          [fieldKey]: {
            firstName: {
              [expectedOperator]: value.firstName,
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

        const result = buildCursorCompositeFieldWhereCondition({
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
          fieldType: FieldMetadataType.FULL_NAME,
          fieldKey: 'name',
          orderBy: [
            {
              name: {
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
          fieldType: FieldMetadataType.FULL_NAME,
          fieldKey: 'name',
          orderBy: [
            {
              name: {
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
          fieldType: FieldMetadataType.FULL_NAME,
          fieldKey: 'name',
          orderBy: [
            {
              name: {
                firstName: OrderByDirection.AscNullsLast,
                lastName: OrderByDirection.DescNullsLast,
              },
            },
          ],
          value: { firstName: 'John', lastName: 'Doe' },
          isForwardPagination: true,
        },
      },
      {
        title: 'two properties - both descending, forward pagination',
        context: {
          description: 'two properties - both descending, forward pagination',
          fieldType: FieldMetadataType.FULL_NAME,
          fieldKey: 'name',
          orderBy: [
            {
              name: {
                firstName: OrderByDirection.DescNullsLast,
                lastName: OrderByDirection.DescNullsLast,
              },
            },
          ],
          value: { firstName: 'John', lastName: 'Doe' },
          isForwardPagination: true,
        },
      },
      {
        title: 'address composite field - both ascending, forward pagination',
        context: {
          description:
            'address composite field - both ascending, forward pagination',
          fieldType: FieldMetadataType.ADDRESS,
          fieldKey: 'address',
          orderBy: [
            {
              address: {
                addressStreet1: OrderByDirection.AscNullsLast,
                addressStreet2: OrderByDirection.AscNullsLast,
                addressCity: OrderByDirection.AscNullsLast,
                addressState: OrderByDirection.AscNullsLast,
                addressCountry: OrderByDirection.AscNullsLast,
                addressPostcode: OrderByDirection.AscNullsLast,
              },
            },
          ],
          value: {
            addressStreet1: '123 Main St',
            addressStreet2: 'Apt 4B',
            addressCity: 'New York',
            addressState: 'NY',
            addressCountry: 'USA',
            addressPostcode: '10001',
          },
          isForwardPagination: true,
        },
      },
    ];

    test.each(multiplePropertiesTestCases)(
      'should handle $title',
      ({ context }) => {
        const { fieldType, fieldKey, orderBy, value, isForwardPagination } =
          context;
        const result = buildCursorCompositeFieldWhereCondition({
          fieldType,
          fieldKey,
          orderBy,
          cursorValue: value,
          isForwardPagination,
        });

        expect(result).toHaveProperty('or');
        const orConditions = result.or;

        expect(Array.isArray(orConditions)).toBe(true);

        const propertiesWithValues = Object.keys(value).length;

        expect(orConditions).toHaveLength(propertiesWithValues);

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

        const result = buildCursorCompositeFieldWhereCondition({
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

  describe('error cases', () => {
    it('should throw error for invalid composite type', () => {
      expect(() =>
        buildCursorCompositeFieldWhereCondition({
          fieldType: FieldMetadataType.TEXT,
          fieldKey: 'person',
          orderBy: [{ person: { firstName: OrderByDirection.AscNullsLast } }],
          cursorValue: { firstName: 'John' },
          isForwardPagination: true,
        }),
      ).toThrow('Composite type definition not found for type: TEXT');
    });

    it('should throw error for invalid cursor with missing order by', () => {
      expect(() =>
        buildCursorCompositeFieldWhereCondition({
          fieldType: FieldMetadataType.FULL_NAME,
          fieldKey: 'person',
          orderBy: [],
          cursorValue: { firstName: 'John' },
          isForwardPagination: true,
        }),
      ).toThrow('Invalid cursor');
    });
  });
});
