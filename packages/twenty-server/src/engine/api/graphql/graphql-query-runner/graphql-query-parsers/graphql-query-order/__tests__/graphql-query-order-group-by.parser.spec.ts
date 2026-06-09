import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import {
  type GroupByDateField,
  type GroupByRegularField,
} from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { getObjectAlias } from 'src/engine/api/common/common-query-runners/utils/get-object-alias-for-group-by.util';
import { GraphqlQueryOrderGroupByParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order-group-by.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

// The query builder aliases the FROM table with `getObjectAlias` (= nameSingular),
// NOT the physical table name (which is `_`-prefixed for custom objects via
// `computeTableName`). These tests pin order-by clauses to that alias so the
// parser stays in sync if the alias convention ever changes.
describe('GraphqlQueryOrderGroupByParser - object alias in order-by clauses', () => {
  const OBJECT_ID = 'rocket-object-id';
  const OBJECT_UNIVERSAL_ID = 'rocket-object-universal-id';
  const NAME_FIELD_ID = 'rocket-name-field-id';
  const NAME_FIELD_UNIVERSAL_ID = 'rocket-name-field-universal-id';
  const DATE_FIELD_ID = 'rocket-launched-at-field-id';
  const DATE_FIELD_UNIVERSAL_ID = 'rocket-launched-at-field-universal-id';

  const nameField = getFlatFieldMetadataMock({
    universalIdentifier: NAME_FIELD_UNIVERSAL_ID,
    objectMetadataId: OBJECT_ID,
    type: FieldMetadataType.TEXT,
    id: NAME_FIELD_ID,
    name: 'name',
  });

  const launchedAtField = getFlatFieldMetadataMock({
    universalIdentifier: DATE_FIELD_UNIVERSAL_ID,
    objectMetadataId: OBJECT_ID,
    type: FieldMetadataType.DATE,
    id: DATE_FIELD_ID,
    name: 'launchedAt',
  });

  // Custom object: physical table is `_rocket`, while the alias is `rocket`.
  const flatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: OBJECT_UNIVERSAL_ID,
    id: OBJECT_ID,
    nameSingular: 'rocket',
    namePlural: 'rockets',
    isCustom: true,
    fieldIds: [NAME_FIELD_ID, DATE_FIELD_ID],
  });

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      [NAME_FIELD_UNIVERSAL_ID]: nameField,
      [DATE_FIELD_UNIVERSAL_ID]: launchedAtField,
    },
    universalIdentifierById: {
      [NAME_FIELD_ID]: NAME_FIELD_UNIVERSAL_ID,
      [DATE_FIELD_ID]: DATE_FIELD_UNIVERSAL_ID,
    },
    universalIdentifiersByApplicationId: {},
  } as unknown as FlatEntityMaps<FlatFieldMetadata>;

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {
      [OBJECT_UNIVERSAL_ID]: flatObjectMetadata,
    },
    universalIdentifierById: {
      [OBJECT_ID]: OBJECT_UNIVERSAL_ID,
    },
    universalIdentifiersByApplicationId: {},
  } as unknown as FlatEntityMaps<FlatObjectMetadata>;

  const objectAlias = getObjectAlias(flatObjectMetadata);
  const physicalTableName = computeTableName(
    flatObjectMetadata.nameSingular,
    // isCustom is upgrade-aware and optional on FlatObjectMetadata; coerce to boolean
    !!flatObjectMetadata.isCustom,
  );

  const buildParser = () =>
    new GraphqlQueryOrderGroupByParser(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

  it('uses the object alias as the table prefix for a custom object', () => {
    // Guards the assumption being tested: a custom object has a `_`-prefixed
    // physical table that is different from its query alias.
    expect(physicalTableName).toBe('_rocket');
    expect(objectAlias).toBe('rocket');
    expect(physicalTableName).not.toBe(objectAlias);
  });

  it('prefixes a scalar group-by order-by with the alias, not the physical table', () => {
    const parser = buildParser();

    const groupByField: GroupByRegularField = { fieldMetadata: nameField };

    const result = parser.parse({
      orderBy: [{ name: OrderByDirection.AscNullsFirst }],
      groupByFields: [groupByField],
    });

    expect(result).toHaveLength(1);

    const orderByKey = Object.keys(result[0])[0];

    expect(orderByKey).toBe(`"${objectAlias}"."name"`);
    expect(orderByKey).not.toContain(physicalTableName);
  });

  it('prefixes a date-granularity group-by order-by with the alias, not the physical table', () => {
    const parser = buildParser();

    const groupByField: GroupByDateField = {
      fieldMetadata: launchedAtField,
      dateGranularity: ObjectRecordGroupByDateGranularity.NONE,
    };

    const result = parser.parse({
      orderBy: [
        {
          launchedAt: {
            orderBy: OrderByDirection.AscNullsFirst,
            granularity: ObjectRecordGroupByDateGranularity.NONE,
          },
        },
      ],
      groupByFields: [groupByField],
    });

    expect(result).toHaveLength(1);

    const orderByKey = Object.keys(result[0])[0];

    expect(orderByKey).toContain(`"${objectAlias}".`);
    expect(orderByKey).not.toContain(physicalTableName);
  });
});
