import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('computeCursorArgFilter', () => {
  const workspaceId = 'workspace-id';
  const objectMetadataId = 'object-id';

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId,
      objectMetadataId,
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      label: overrides.name,
      ...overrides,
    }) as FlatFieldMetadata;

  const nameField = createMockField({
    id: 'name-id',
    type: FieldMetadataType.TEXT,
    name: 'name',
    label: 'Name',
  });

  const ageField = createMockField({
    id: 'age-id',
    type: FieldMetadataType.NUMBER,
    name: 'age',
    label: 'Age',
  });

  const fullNameField = createMockField({
    id: 'fullname-id',
    type: FieldMetadataType.FULL_NAME,
    name: 'fullName',
    label: 'Full Name',
  });

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byId: fields.reduce(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    idByUniversalIdentifier: fields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field.id;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
    nameField,
    ageField,
    fullNameField,
  ]);

  const flatObjectMetadata: FlatObjectMetadata = {
    id: objectMetadataId,
    workspaceId,
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    targetTableName: 'person',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: false,
    isAuditLogged: false,
    isSearchable: false,
    icon: 'Icon123',
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: objectMetadataId,
    fieldMetadataIds: ['name-id', 'age-id', 'fullname-id'],
    indexMetadataIds: [],
    viewIds: [],
    applicationId: null,
  } as unknown as FlatObjectMetadata;

  describe('basic cursor filtering', () => {
    it('should return empty array when cursor is empty', () => {
      const result = computeCursorArgFilter(
        {},
        [],
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
          flatObjectMetadata,
          flatFieldMetadataMaps,
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
          flatObjectMetadata,
          flatFieldMetadataMaps,
          true,
        ),
      ).toThrow(GraphqlQueryRunnerException);
    });
  });
});
