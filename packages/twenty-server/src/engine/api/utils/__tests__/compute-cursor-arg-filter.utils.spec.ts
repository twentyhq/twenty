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

  const idField = createMockField({
    id: 'id-id',
    type: FieldMetadataType.UUID,
    name: 'id',
    label: 'Id',
    isNullable: false,
  });

  const closeDateField = createMockField({
    id: 'closedate-id',
    type: FieldMetadataType.DATE_TIME,
    name: 'closeDate',
    label: 'Close Date',
    isNullable: true,
  });

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byUniversalIdentifier: fields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    universalIdentifierById: fields.reduce(
      (acc, field) => {
        acc[field.id] = field.universalIdentifier;

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
    idField,
    closeDateField,
  ]);

  const flatObjectMetadata: FlatObjectMetadata = {
    id: objectMetadataId,
    workspaceId,
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    targetTableName: 'person',
    isRemote: false,
    isActive: true,
    isSystem: false,
    isAuditLogged: false,
    isSearchable: false,
    icon: 'Icon123',
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: objectMetadataId,
    fieldIds: ['name-id', 'age-id', 'fullname-id', 'id-id', 'closedate-id'],
    indexMetadataIds: [],
    viewIds: [],
    applicationId: null,
  } as unknown as FlatObjectMetadata;

  describe('basic cursor filtering', () => {
    it('should return empty array when cursor is empty', () => {
      const result = computeCursorArgFilter({
        cursor: {},
        orderBy: [],
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([]);
    });

    it('should compute forward pagination filter for single field', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([{ name: { gt: 'John' } }]);
    });

    it('should compute backward pagination filter for single field', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: false,
      });

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

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
        { name: { gt: 'John' } },
        {
          and: [
            { name: { eq: 'John' } },
            { or: [{ age: { lt: 30 } }, { age: { is: 'NULL' } }] },
          ],
        },
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

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
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

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
        {
          fullName: {
            firstName: { gt: 'John' },
          },
        },
      ]);
    });

    it('should handle dotted composite cursor keys', () => {
      const cursor = {
        'fullName.firstName': 'John',
        'fullName.lastName': 'Doe',
      } as any;
      const orderBy = [
        {
          fullName: {
            firstName: OrderByDirection.AscNullsLast,
            lastName: OrderByDirection.AscNullsLast,
          },
        },
      ];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
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

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: false,
      });

      expect(result).toEqual([
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
      ]);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid field metadata', () => {
      const cursor = { invalidField: 'value' };
      const orderBy = [{ invalidField: OrderByDirection.AscNullsLast }];

      expect(() =>
        computeCursorArgFilter({
          cursor,
          orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          isForwardPagination: true,
        }),
      ).toThrow(GraphqlQueryRunnerException);
    });

    it('should throw error for missing orderBy entry', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ age: OrderByDirection.AscNullsLast }];

      expect(() =>
        computeCursorArgFilter({
          cursor,
          orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          isForwardPagination: true,
        }),
      ).toThrow(GraphqlQueryRunnerException);
    });
  });

  describe('null-aware filtering on nullable fields', () => {
    it('should include the NULL block when nulls are scanned after the cursor', () => {
      const cursor = { closeDate: '2026-01-01T00:00:00Z' };
      const orderBy = [{ closeDate: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
        {
          or: [
            { closeDate: { gt: '2026-01-01T00:00:00Z' } },
            { closeDate: { is: 'NULL' } },
          ],
        },
      ]);
    });

    it('should not include the NULL block when nulls are scanned before the cursor', () => {
      const cursor = { closeDate: '2026-01-01T00:00:00Z' };
      const orderBy = [{ closeDate: OrderByDirection.AscNullsFirst }];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([{ closeDate: { gt: '2026-01-01T00:00:00Z' } }]);
    });

    it('should continue on tie-breaking keys when the cursor sits in a trailing NULL block', () => {
      const cursor = { closeDate: null, id: 'uuid-1' };
      const orderBy = [
        { closeDate: OrderByDirection.AscNullsLast },
        { id: OrderByDirection.AscNullsFirst },
      ];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
        {
          and: [{ closeDate: { is: 'NULL' } }, { id: { gt: 'uuid-1' } }],
        },
      ]);
    });

    it('should advance into the non-null region when the cursor sits in a leading NULL block', () => {
      const cursor = { closeDate: null, id: 'uuid-1' };
      const orderBy = [
        { closeDate: OrderByDirection.AscNullsFirst },
        { id: OrderByDirection.AscNullsFirst },
      ];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([
        { closeDate: { is: 'NOT_NULL' } },
        {
          and: [{ closeDate: { is: 'NULL' } }, { id: { gt: 'uuid-1' } }],
        },
      ]);
    });

    it('should swap the NULL block side for backward pagination', () => {
      const cursor = { closeDate: '2026-01-01T00:00:00Z' };
      const orderBy = [{ closeDate: OrderByDirection.AscNullsFirst }];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: false,
      });

      expect(result).toEqual([
        {
          or: [
            { closeDate: { lt: '2026-01-01T00:00:00Z' } },
            { closeDate: { is: 'NULL' } },
          ],
        },
      ]);
    });

    it('should not add a NULL block for fields with a null-equivalent default', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter({
        cursor,
        orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isForwardPagination: true,
      });

      expect(result).toEqual([{ name: { gt: 'John' } }]);
    });
  });

  describe('cursor and orderBy mismatch guard', () => {
    it('should throw when the cursor is missing the value of an orderBy scalar field', () => {
      const cursor = { id: 'uuid-1' };
      const orderBy = [
        { closeDate: OrderByDirection.AscNullsLast },
        { id: OrderByDirection.AscNullsFirst },
      ];

      expect(() =>
        computeCursorArgFilter({
          cursor,
          orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          isForwardPagination: true,
        }),
      ).toThrow('Cursor is missing the value for orderBy field "closeDate"');
    });

    it('should throw when the cursor is missing an ordered composite sub-field', () => {
      const cursor = { id: 'uuid-1' };
      const orderBy = [
        { fullName: { firstName: OrderByDirection.AscNullsLast } },
        { id: OrderByDirection.AscNullsFirst },
      ];

      expect(() =>
        computeCursorArgFilter({
          cursor,
          orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          isForwardPagination: true,
        }),
      ).toThrow(
        'Cursor is missing the value for orderBy field "fullName.firstName"',
      );
    });

    it('should accept a null cursor value as covering its orderBy field', () => {
      const cursor = { closeDate: null, id: 'uuid-1' };
      const orderBy = [
        { closeDate: OrderByDirection.AscNullsLast },
        { id: OrderByDirection.AscNullsFirst },
      ];

      expect(() =>
        computeCursorArgFilter({
          cursor,
          orderBy,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          isForwardPagination: true,
        }),
      ).not.toThrow();
    });
  });
});
