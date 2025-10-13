import { faker } from '@faker-js/faker';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { GraphqlQuerySelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getMockObjectMetadataItemWithFieldsMaps } from 'src/utils/__test__/get-object-metadata-item-with-fields-maps.mock';

// Minimal chainable query builder mock
const createQueryBuilderMock = () => {
  const qb: any = {
    withDeleted: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
  };

  return qb;
};

describe('GraphqlQueryParser', () => {
  let objectMetadataMaps: ObjectMetadataMaps;
  let objectMetadataItem: ObjectMetadataItemWithFieldMaps;

  beforeEach(() => {
    jest.clearAllMocks();

    const nameSingular = 'mockObject';
    const objectId = faker.string.uuid();

    objectMetadataItem = getMockObjectMetadataItemWithFieldsMaps({
      id: objectId,
      nameSingular,
      namePlural: `${nameSingular}s`,
      workspaceId: faker.string.uuid(),
      fieldsById: {},
      fieldIdByJoinColumnName: {},
      fieldIdByName: {},
      indexMetadatas: [],
    });

    objectMetadataMaps = {
      byId: { [objectId]: objectMetadataItem },
      idByNameSingular: { [nameSingular]: objectId },
    };
  });

  describe('applyDeletedAtToBuilder', () => {
    test('calls withDeleted when deletedAt filter at top-level', () => {
      const qb = createQueryBuilderMock();
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      parser.applyDeletedAtToBuilder(qb as any, { deletedAt: null } as any);

      expect(qb.withDeleted).toHaveBeenCalledTimes(1);
    });

    test('calls withDeleted when deletedAt filter nested in object', () => {
      const qb = createQueryBuilderMock();
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      parser.applyDeletedAtToBuilder(
        qb as any,
        { some: { deep: { path: { deletedAt: { $ne: null } } } } } as any,
      );

      expect(qb.withDeleted).toHaveBeenCalledTimes(1);
    });

    test('calls withDeleted when deletedAt filter present in array', () => {
      const qb = createQueryBuilderMock();
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      parser.applyDeletedAtToBuilder(
        qb as any,
        [{ a: 1 }, { deletedAt: 1 }] as any,
      );

      expect(qb.withDeleted).toHaveBeenCalledTimes(1);
    });

    test('does not call withDeleted when deletedAt is absent', () => {
      const qb = createQueryBuilderMock();
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      parser.applyDeletedAtToBuilder(qb as any, { foo: 'bar' } as any);

      expect(qb.withDeleted).not.toHaveBeenCalled();
    });
  });

  describe('applyOrderToBuilder', () => {
    test('delegates to orderBy with parsed order when not grouped', () => {
      const qb = createQueryBuilderMock();
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      const parsed = { 't.name': 'ASC', 't.createdAt': 'DESC' } as any;
      const orderSpy = jest
        .spyOn(GraphqlQueryOrderFieldParser.prototype, 'parse')
        .mockReturnValue(parsed);

      const returned = parser.applyOrderToBuilder(
        qb as any,
        { name: 'AscNullsLast' } as any,
        objectMetadataItem.nameSingular,
        true,
        false,
      );

      expect(orderSpy).toHaveBeenCalledWith(
        { name: 'AscNullsLast' },
        objectMetadataItem.nameSingular,
        true,
        false,
      );
      expect(qb.orderBy).toHaveBeenCalledWith(parsed);
      expect(returned).toBe(qb);
    });

    test('uses orderBy then addOrderBy when grouped', () => {
      const qb = createQueryBuilderMock();
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      const parsedGrouped = {
        'COUNT(t.id)': { order: 'ASC', nulls: 'NULLS LAST' },
        't.name': { order: 'DESC', nulls: undefined },
      } as const;

      jest
        .spyOn(GraphqlQueryOrderFieldParser.prototype, 'parse')
        .mockReturnValue(parsedGrouped);

      const returned = parser.applyOrderToBuilder(
        qb as any,
        { name: 'AscNullsLast' } as any,
        objectMetadataItem.nameSingular,
        true,
        true,
      );

      const entries = Object.entries(parsedGrouped);

      expect(qb.orderBy).toHaveBeenCalledWith(
        entries[0][0],
        entries[0][1].order,
        entries[0][1].nulls,
      );
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        entries[1][0],
        entries[1][1].order,
        entries[1][1].nulls,
      );
      expect(returned).toBe(qb);
    });
  });

  describe('applyFilterToBuilder', () => {
    test('delegates to filter condition parser and returns its result', () => {
      const qb = createQueryBuilderMock();
      const newQb = { ...createQueryBuilderMock(), marker: 'returned' } as any;
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );

      const filterSpy = jest
        .spyOn(GraphqlQueryFilterConditionParser.prototype, 'parse')
        .mockReturnValue(newQb);

      const result = parser.applyFilterToBuilder(
        qb as any,
        objectMetadataItem.nameSingular,
        { id: { eq: '1' } } as any,
      );

      expect(filterSpy).toHaveBeenCalledWith(
        qb,
        objectMetadataItem.nameSingular,
        { id: { eq: '1' } },
      );
      expect(result).toBe(newQb);
    });
  });

  describe('parseSelectedFields', () => {
    test('throws when object metadata for parent is not found', () => {
      const missingMaps: ObjectMetadataMaps = {
        byId: {},
        idByNameSingular: {},
      };
      const parser = new GraphqlQueryParser(objectMetadataItem, missingMaps);

      expect(() =>
        parser.parseSelectedFields(objectMetadataItem, { id: {} }, missingMaps),
      ).toThrow(GraphqlQueryRunnerException);

      try {
        parser.parseSelectedFields(objectMetadataItem, { id: {} }, missingMaps);
      } catch (e) {
        const err = e as GraphqlQueryRunnerException;

        expect(err.code).toBe(
          GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
        expect(err.message).toContain(objectMetadataItem.nameSingular);
      }
    });

    test('delegates to GraphqlQuerySelectedFieldsParser when metadata exists', () => {
      const parser = new GraphqlQueryParser(
        objectMetadataItem,
        objectMetadataMaps,
      );
      const selectedFieldsResult = {
        selectedColumns: ['t.id'],
        selectedRelations: {},
        selectedAggregates: {},
      } as any;

      const selectedSpy = jest
        .spyOn(GraphqlQuerySelectedFieldsParser.prototype, 'parse')
        .mockReturnValue(selectedFieldsResult);

      const result = parser.parseSelectedFields(
        objectMetadataItem,
        { id: {} },
        objectMetadataMaps,
      );

      expect(selectedSpy).toHaveBeenCalled();
      expect(result).toBe(selectedFieldsResult);
    });
  });

  describe('computeRedisFields', () => {});
});
