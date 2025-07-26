import { FieldMetadataType } from 'twenty-shared/types';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.utils';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';
import { getMockObjectMetadataItemWithFieldsMaps } from 'src/utils/__test__/get-object-metadata-item-with-fields-maps.mock';

describe('computeCursorArgFilter', () => {
  const objectMetadataItemWithFieldMaps =
    getMockObjectMetadataItemWithFieldsMaps({
      id: 'object-id',
      workspaceId: 'workspace-id',
      nameSingular: 'person',
      namePlural: 'people',
      isCustom: false,
      isRemote: false,
      labelSingular: 'Person',
      labelPlural: 'People',
      targetTableName: 'person',
      indexMetadatas: [],
      isSystem: false,
      isActive: true,
      isAuditLogged: false,
      isSearchable: false,
      fieldIdByJoinColumnName: {},
      icon: 'Icon123',
      fieldIdByName: {
        name: 'name-id',
        age: 'age-id',
        fullName: 'fullname-id',
      },
      fieldsById: {
        'name-id': getMockFieldMetadataEntity({
          workspaceId: 'workspace-id',
          objectMetadataId: 'object-id',
          id: 'name-id',
          type: FieldMetadataType.TEXT,
          name: 'name',
          label: 'Name',
          isLabelSyncedWithName: true,
          isNullable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        'age-id': getMockFieldMetadataEntity({
          workspaceId: 'workspace-id',
          objectMetadataId: 'object-id',
          id: 'age-id',
          type: FieldMetadataType.NUMBER,
          name: 'age',
          label: 'Age',
          isLabelSyncedWithName: true,
          isNullable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        'fullname-id': getMockFieldMetadataEntity({
          workspaceId: 'workspace-id',
          objectMetadataId: 'object-id',
          id: 'fullname-id',
          type: FieldMetadataType.FULL_NAME,
          name: 'fullName',
          label: 'Full Name',
          isLabelSyncedWithName: true,
          isNullable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    });

  describe('basic cursor filtering', () => {
    it('should return empty array when cursor is empty', () => {
      const result = computeCursorArgFilter(
        {},
        [],
        objectMetadataItemWithFieldMaps,
        true,
      );

      expect(result).toEqual([]);
    });

    it('should compute forward pagination filter for single field', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        objectMetadataItemWithFieldMaps,
        true,
      );

      expect(result).toEqual([{ name: { gt: 'John' } }]);
    });

    it('should compute backward pagination filter for single field', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        objectMetadataItemWithFieldMaps,
        false,
      );

      expect(result).toEqual([{ name: { lt: 'John' } }]);
    });
  });

  describe('multiple fields cursor filtering', () => {
    it('should handle multiple cursor fields with forward pagination', () => {
      const cursor = { name: 'John', age: 30 };
      const orderBy = [
        { name: OrderByDirection.AscNullsLast },
        { age: OrderByDirection.DescNullsLast },
      ];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        objectMetadataItemWithFieldMaps,
        true,
      );

      expect(result).toEqual([
        { name: { gt: 'John' } },
        { and: [{ name: { eq: 'John' } }, { age: { lt: 30 } }] },
      ]);
    });
  });

  describe('composite field handling', () => {
    it('should handle fullName composite field with proper ordering', () => {
      const cursor = {
        fullName: { firstName: 'John', lastName: 'Doe' },
      };
      const orderBy = [
        {
          fullName: {
            firstName: OrderByDirection.AscNullsLast,
            lastName: OrderByDirection.AscNullsLast,
          },
        },
      ];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        objectMetadataItemWithFieldMaps,
        true,
      );

      expect(result).toEqual([
        {
          or: [
            {
              fullName: {
                firstName: { gt: 'John' },
              },
            },
            {
              and: [
                {
                  fullName: {
                    firstName: { eq: 'John' },
                  },
                },
                {
                  fullName: {
                    lastName: { gt: 'Doe' },
                  },
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should handle single property composite field', () => {
      const cursor = {
        fullName: { firstName: 'John' },
      };
      const orderBy = [
        {
          fullName: {
            firstName: OrderByDirection.AscNullsLast,
          },
        },
      ];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        objectMetadataItemWithFieldMaps,
        true,
      );

      expect(result).toEqual([
        {
          fullName: {
            firstName: { gt: 'John' },
          },
        },
      ]);
    });

    it('should handle composite field with backward pagination', () => {
      const cursor = {
        fullName: { firstName: 'John', lastName: 'Doe' },
      };
      const orderBy = [
        {
          fullName: {
            firstName: OrderByDirection.AscNullsLast,
            lastName: OrderByDirection.AscNullsLast,
          },
        },
      ];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        objectMetadataItemWithFieldMaps,
        false,
      );

      expect(result).toEqual([
        {
          or: [
            {
              fullName: {
                firstName: { lt: 'John' },
              },
            },
            {
              and: [
                {
                  fullName: {
                    firstName: { eq: 'John' },
                  },
                },
                {
                  fullName: {
                    lastName: { lt: 'Doe' },
                  },
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid field metadata', () => {
      const cursor = { invalidField: 'value' };
      const orderBy = [{ invalidField: OrderByDirection.AscNullsLast }];

      expect(() =>
        computeCursorArgFilter(
          cursor,
          orderBy,
          objectMetadataItemWithFieldMaps,
          true,
        ),
      ).toThrow(GraphqlQueryRunnerException);
    });

    it('should throw error for missing orderBy entry', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ age: OrderByDirection.AscNullsLast }];

      expect(() =>
        computeCursorArgFilter(
          cursor,
          orderBy,
          objectMetadataItemWithFieldMaps,
          true,
        ),
      ).toThrow(GraphqlQueryRunnerException);
    });
  });
});
