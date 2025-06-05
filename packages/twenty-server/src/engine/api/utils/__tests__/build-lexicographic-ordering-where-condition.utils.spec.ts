import { title } from 'process';

import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { buildLexicographicOrderingWhereCondition } from 'src/engine/api/utils/build-lexicographic-ordering-where-condition.utils';

describe('buildLexicographicOrderingWhereCondition', () => {
  describe('empty properties', () => {
    it('should return empty object when filteredProperties is empty', () => {
      const result = buildLexicographicOrderingWhereCondition(
        [],
        'person',
        { person: { name: OrderByDirection.AscNullsLast } },
        { name: 'John' },
        true,
      );

      expect(result).toEqual({});
    });
  });

  describe('single property cases', () => {
    const singlePropertyTestCases: EachTestingContext<{
      description: string;
      filteredProperties: { name: string; type: FieldMetadataType }[];
      key: string;
      keyOrderBy: Record<string, any>;
      value: { [key: string]: any };
      isForwardPagination: boolean;
      operator?: string;
      expectedOperator: string;
    }>[] = [
      {
        title: 'ascending order with forward pagination',
        context: {
          description: 'ascending order with forward pagination',
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
          ],
          key: 'person',
          keyOrderBy: { person: { firstName: OrderByDirection.AscNullsLast } },
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
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
          ],
          key: 'person',
          keyOrderBy: { person: { firstName: OrderByDirection.AscNullsLast } },
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
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
          ],
          key: 'person',
          keyOrderBy: { person: { firstName: OrderByDirection.DescNullsLast } },
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
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
          ],
          key: 'person',
          keyOrderBy: { person: { firstName: OrderByDirection.DescNullsLast } },
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
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
          operator,
          expectedOperator,
        } = context;

        const result = buildLexicographicOrderingWhereCondition(
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
          operator,
        );

        expect(result).toEqual({
          [key]: {
            [filteredProperties[0].name]: {
              [expectedOperator]:
                value[filteredProperties[0].name as keyof typeof value],
            },
          },
        });
      },
    );

    test.each(singlePropertyTestCases)(
      'should match snapshot for $title',
      ({ context }) => {
        const {
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
        } = context;

        const result = buildLexicographicOrderingWhereCondition(
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
        );

        expect(result).toMatchSnapshot(`single property - ${title}`);
      },
    );
  });

  describe('multiple properties cases', () => {
    const multiplePropertiesTestCases: EachTestingContext<{
      description: string;
      filteredProperties: { name: string; type: FieldMetadataType }[];
      key: string;
      keyOrderBy: Record<string, any>;
      value: { [key: string]: any };
      isForwardPagination: boolean;
    }>[] = [
      {
        title: 'two properties - both ascending, forward pagination',
        context: {
          description: 'two properties - both ascending, forward pagination',
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
            { name: 'lastName', type: FieldMetadataType.TEXT },
          ],
          key: 'person',
          keyOrderBy: {
            person: {
              firstName: OrderByDirection.AscNullsLast,
              lastName: OrderByDirection.AscNullsLast,
            },
          },
          value: { firstName: 'John', lastName: 'Doe' },
          isForwardPagination: true,
        },
      },
      {
        title: 'two properties - both ascending, backward pagination',
        context: {
          description: 'two properties - both ascending, backward pagination',
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
            { name: 'lastName', type: FieldMetadataType.TEXT },
          ],
          key: 'person',
          keyOrderBy: {
            person: {
              firstName: OrderByDirection.AscNullsLast,
              lastName: OrderByDirection.AscNullsLast,
            },
          },
          value: { firstName: 'John', lastName: 'Doe' },
          isForwardPagination: false,
        },
      },
      {
        title: 'two properties - mixed ordering, forward pagination',
        context: {
          description: 'two properties - mixed ordering, forward pagination',
          filteredProperties: [
            { name: 'firstName', type: FieldMetadataType.TEXT },
            { name: 'age', type: FieldMetadataType.NUMBER },
          ],
          key: 'person',
          keyOrderBy: {
            person: {
              firstName: OrderByDirection.AscNullsLast,
              age: OrderByDirection.DescNullsLast,
            },
          },
          value: { firstName: 'Alice', age: 25 },
          isForwardPagination: true,
        },
      },
      {
        title: 'three properties - all ascending, forward pagination',
        context: {
          description: 'three properties - all ascending, forward pagination',
          filteredProperties: [
            { name: 'city', type: FieldMetadataType.TEXT },
            { name: 'firstName', type: FieldMetadataType.TEXT },
            { name: 'id', type: FieldMetadataType.UUID },
          ],
          key: 'employee',
          keyOrderBy: {
            employee: {
              city: OrderByDirection.AscNullsLast,
              firstName: OrderByDirection.AscNullsLast,
              id: OrderByDirection.AscNullsLast,
            },
          },
          value: { city: 'New York', firstName: 'Bob', id: 'uuid-123' },
          isForwardPagination: true,
        },
      },
    ];

    test.each(multiplePropertiesTestCases)(
      'should handle $title',
      ({ context }) => {
        const {
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
        } = context;
        const result = buildLexicographicOrderingWhereCondition(
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
        );

        expect(result).toHaveProperty('or');
        const orConditions = result.or;

        expect(Array.isArray(orConditions)).toBe(true);
        expect(orConditions).toHaveLength(filteredProperties.length);

        expect(orConditions[0]).toHaveProperty(key);

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
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
        } = context;

        const result = buildLexicographicOrderingWhereCondition(
          filteredProperties,
          key,
          keyOrderBy,
          value,
          isForwardPagination,
        );

        expect(result).toMatchSnapshot(`multiple properties - ${title}`);
      },
    );
  });
});
