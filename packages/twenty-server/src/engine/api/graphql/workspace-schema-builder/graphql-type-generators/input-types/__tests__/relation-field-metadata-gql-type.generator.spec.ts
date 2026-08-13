import { GraphQLInputObjectType } from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { type TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { type GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('RelationFieldMetadataGqlInputTypeGenerator', () => {
  const targetObjectMetadata = {
    id: 'fellowship-object-id',
    nameSingular: 'fellowship',
    namePlural: 'fellowships',
    universalIdentifier: 'fellowship-object-universal-id',
  } as FlatObjectMetadata;
  const context = {
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [targetObjectMetadata.universalIdentifier]: targetObjectMetadata,
      },
      universalIdentifierById: {
        [targetObjectMetadata.id]: targetObjectMetadata.universalIdentifier,
      },
      universalIdentifiersByApplicationId: {},
    } as FlatEntityMaps<FlatObjectMetadata>,
  } as SchemaGenerationContext;
  const targetFilterInputType = new GraphQLInputObjectType({
    name: 'FellowshipFilterInput',
    fields: {},
  });
  const getGqlTypeByKey = jest.fn(() => targetFilterInputType);
  const generator = new RelationFieldMetadataGqlInputTypeGenerator(
    {} as TypeMapperService,
    { getGqlTypeByKey } as unknown as GqlTypesStorage,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds the target object filter input for a one-to-many relation', () => {
    const fieldMetadata = {
      id: 'fellowships-field-id',
      name: 'fellowships',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: targetObjectMetadata.id,
      settings: { relationType: RelationType.ONE_TO_MANY },
    } as FlatFieldMetadata<FieldMetadataType.RELATION>;

    const result = generator.generateSimpleRelationFieldFilterInputType({
      fieldMetadata,
      typeOptions: {},
      context,
    });

    expect(result).toEqual({
      fellowships: {
        type: targetFilterInputType,
        description: 'Filter on fields of any related fellowship',
      },
    });
  });

  it('keeps one-to-many morph relations out of filter inputs', () => {
    const fieldMetadata = {
      id: 'targets-field-id',
      name: 'targets',
      type: FieldMetadataType.MORPH_RELATION,
      relationTargetObjectMetadataId: targetObjectMetadata.id,
      settings: { relationType: RelationType.ONE_TO_MANY },
    } as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

    const result = generator.generateSimpleRelationFieldFilterInputType({
      fieldMetadata,
      typeOptions: {},
      context,
    });

    expect(result).toEqual({});
    expect(getGqlTypeByKey).not.toHaveBeenCalled();
  });
});
