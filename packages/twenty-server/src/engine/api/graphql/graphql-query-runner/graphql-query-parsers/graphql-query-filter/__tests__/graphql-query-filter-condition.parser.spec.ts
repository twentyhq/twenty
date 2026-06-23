import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// `producesWhereCondition` is the load-bearing guard against "empty but
// defined" filters wiping every row. These cases lock the cases that the
// shallow structural guard (`isEmptyRecordFilter`) intentionally misses:
// empty composites and empty boolean-operator wrappers.
describe('GraphqlQueryFilterConditionParser - producesWhereCondition', () => {
  const OBJECT_ID = 'company-object-id';
  const OBJECT_UNIVERSAL_ID = 'company-object-universal-id';
  const TITLE_FIELD_ID = 'company-title-field-id';
  const TITLE_FIELD_UNIVERSAL_ID = 'company-title-field-universal-id';
  const NAME_FIELD_ID = 'company-name-field-id';
  const NAME_FIELD_UNIVERSAL_ID = 'company-name-field-universal-id';

  const titleField = getFlatFieldMetadataMock({
    universalIdentifier: TITLE_FIELD_UNIVERSAL_ID,
    objectMetadataId: OBJECT_ID,
    type: FieldMetadataType.TEXT,
    id: TITLE_FIELD_ID,
    name: 'title',
  });

  const nameField = getFlatFieldMetadataMock({
    universalIdentifier: NAME_FIELD_UNIVERSAL_ID,
    objectMetadataId: OBJECT_ID,
    type: FieldMetadataType.FULL_NAME,
    id: NAME_FIELD_ID,
    name: 'name',
  });

  const flatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: OBJECT_UNIVERSAL_ID,
    id: OBJECT_ID,
    nameSingular: 'company',
    namePlural: 'companies',
    isCustom: false,
    fieldIds: [TITLE_FIELD_ID, NAME_FIELD_ID],
  });

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      [TITLE_FIELD_UNIVERSAL_ID]: titleField,
      [NAME_FIELD_UNIVERSAL_ID]: nameField,
    },
    universalIdentifierById: {
      [TITLE_FIELD_ID]: TITLE_FIELD_UNIVERSAL_ID,
      [NAME_FIELD_ID]: NAME_FIELD_UNIVERSAL_ID,
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

  const buildParser = () =>
    new GraphqlQueryFilterConditionParser(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    );

  const produces = (filter: Partial<ObjectRecordFilter>): boolean =>
    buildParser().producesWhereCondition('company', filter);

  describe('non-constraining filters', () => {
    it.each<[string, Partial<ObjectRecordFilter>]>([
      ['an empty filter object', {}],
      ['an empty composite field', { name: {} } as Partial<ObjectRecordFilter>],
      ['an empty AND wrapper', { and: [] }],
      ['an AND wrapper of empty filters', { and: [{}, {}] }],
      ['an empty OR wrapper', { or: [] }],
      ['an OR wrapper of empty filters', { or: [{}] }],
      ['an empty NOT wrapper', { not: {} }],
    ])('returns false for %s', (_label, filter) => {
      expect(produces(filter)).toBe(false);
    });
  });

  describe('constraining filters', () => {
    it.each<[string, Partial<ObjectRecordFilter>]>([
      ['a leaf field predicate', { title: { eq: 'Acme' } }],
      [
        'a composite sub-field predicate',
        { name: { firstName: { eq: 'Jane' } } } as Partial<ObjectRecordFilter>,
      ],
      ['a real predicate inside AND', { and: [{ title: { eq: 'Acme' } }] }],
      ['a real predicate inside OR', { or: [{ title: { eq: 'Acme' } }] }],
      ['a real predicate inside NOT', { not: { title: { eq: 'Acme' } } }],
    ])('returns true for %s', (_label, filter) => {
      expect(produces(filter)).toBe(true);
    });
  });
});
