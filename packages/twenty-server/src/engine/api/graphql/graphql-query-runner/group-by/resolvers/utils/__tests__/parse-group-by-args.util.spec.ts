import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { parseGroupByArgs } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/parse-group-by-args.util';
import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatFieldMetadata = (
  overrides: Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
    objectMetadataId: string;
  },
): FlatFieldMetadata =>
  ({
    ...overrides,
    universalIdentifier: overrides.id,
  }) as FlatFieldMetadata;

const buildFlatObjectMetadata = (
  overrides: Partial<FlatObjectMetadata> & {
    id: string;
    nameSingular: string;
    fieldIds: string[];
  },
): FlatObjectMetadata =>
  ({
    ...overrides,
    universalIdentifier: overrides.id,
  }) as FlatObjectMetadata;

const buildFlatFieldMetadataMaps = (
  entries: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    entries.map((entry) => [entry.universalIdentifier, entry]),
  ),
  universalIdentifierById: Object.fromEntries(
    entries.map((entry) => [entry.id, entry.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatObjectMetadataMaps = (
  entries: FlatObjectMetadata[],
): FlatEntityMaps<FlatObjectMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    entries.map((entry) => [entry.universalIdentifier, entry]),
  ),
  universalIdentifierById: Object.fromEntries(
    entries.map((entry) => [entry.id, entry.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('parseGroupByArgs', () => {
  const personObjectId = 'person-object-id';
  const companyObjectId = 'company-object-id';

  const companyRelationFieldId = 'company-relation-field-id';
  const companyIdFieldId = 'company-id-field-id';
  const companyCurrencyFieldId = 'company-currency-field-id';
  const statusFieldId = 'status-field-id';

  const companyRelationField = buildFlatFieldMetadata({
    id: companyRelationFieldId,
    name: 'company',
    type: FieldMetadataType.RELATION,
    objectMetadataId: personObjectId,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
    },
    relationTargetObjectMetadataId: companyObjectId,
  });

  const statusField = buildFlatFieldMetadata({
    id: statusFieldId,
    name: 'status',
    type: FieldMetadataType.TEXT,
    objectMetadataId: personObjectId,
  });

  const companyIdField = buildFlatFieldMetadata({
    id: companyIdFieldId,
    name: 'id',
    type: FieldMetadataType.TEXT,
    objectMetadataId: companyObjectId,
    isSystem: true,
  });

  const companyCurrencyField = buildFlatFieldMetadata({
    id: companyCurrencyFieldId,
    name: 'revenue',
    type: FieldMetadataType.CURRENCY,
    objectMetadataId: companyObjectId,
  });

  const personObjectMetadata = buildFlatObjectMetadata({
    id: personObjectId,
    nameSingular: 'person',
    fieldIds: [companyRelationFieldId, statusFieldId],
  });

  const companyObjectMetadata = buildFlatObjectMetadata({
    id: companyObjectId,
    nameSingular: 'company',
    fieldIds: [companyIdFieldId, companyCurrencyFieldId],
  });

  const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
    companyRelationField,
    statusField,
    companyIdField,
    companyCurrencyField,
  ]);

  const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
    personObjectMetadata,
    companyObjectMetadata,
  ]);

  it('parses relation join-column groupBy input using boolean true', () => {
    const args: GroupByResolverArgs = {
      groupBy: [{ companyId: true }],
    };

    const result = parseGroupByArgs(
      args,
      personObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([
      {
        fieldMetadata: companyRelationField,
        nestedFieldMetadata: companyIdField,
      },
    ]);
  });

  it('throws for unsupported composite subfield on relation target field', () => {
    const args = {
      groupBy: [
        {
          company: {
            revenue: {
              invalidSubField: true,
            },
          },
        },
      ],
    } as unknown as GroupByResolverArgs;

    expect(() =>
      parseGroupByArgs(
        args,
        personObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  it('parses supported composite subfield on relation target field', () => {
    const args = {
      groupBy: [
        {
          company: {
            revenue: {
              amountMicros: true,
            },
          },
        },
      ],
    } as unknown as GroupByResolverArgs;

    const result = parseGroupByArgs(
      args,
      personObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([
      {
        fieldMetadata: companyRelationField,
        nestedFieldMetadata: companyCurrencyField,
        nestedSubFieldName: 'amountMicros',
      },
    ]);
  });
});
