import { Injectable, Logger } from '@nestjs/common';

import {
  type CompositeType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import {
  type TypeGenerators,
  instantiateTypeGenerators,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/type-generators';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

@Injectable()
export class GqlTypeGenerator {
  private readonly logger = new Logger(GqlTypeGenerator.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly workspaceResolverBuilderService: WorkspaceResolverBuilderService,
  ) {}

  async buildAndStore(
    context: SchemaGenerationContext,
  ): Promise<GqlTypesStorage> {
    const gqlTypesStorage = new GqlTypesStorage();
    const generators = instantiateTypeGenerators(
      gqlTypesStorage,
      this.typeMapperService,
      this.workspaceResolverBuilderService,
    );

    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.buildAndStoreCompositeFieldMetadataGqlTypes(
      compositeTypeCollection,
      generators,
    );
    generators.groupByDateGranularityInputTypeGenerator.buildAndStore();
    this.buildAndStoreObjectMetadataGqlTypes(context, generators);
    await generators.queryTypeGenerator.buildAndStore(context);
    generators.mutationTypeGenerator.buildAndStore(context);

    return gqlTypesStorage;
  }

  private buildAndStoreCompositeFieldMetadataGqlTypes(
    compositeTypes: CompositeType[],
    generators: TypeGenerators,
  ) {
    for (const compositeType of compositeTypes) {
      generators.compositeFieldMetadataGqlEnumTypeGenerator.buildAndStore(
        compositeType,
      );
      generators.compositeFieldMetadataGqlObjectTypeGenerator.buildAndStore(
        compositeType,
      );
      generators.compositeFieldMetadataGqlInputTypeGenerator.buildAndStore(
        compositeType,
      );
    }
  }

  private buildAndStoreObjectMetadataGqlTypes(
    context: SchemaGenerationContext,
    generators: TypeGenerators,
  ) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } = context;
    const objectMetadataCollection = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    this.logger.log(
      `Generating metadata objects: [${objectMetadataCollection
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    for (const flatObjectMetadata of objectMetadataCollection) {
      const fields = getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      generators.enumFieldMetadataGqlEnumTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
      );
      generators.objectMetadataGqlObjectTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
      );
      generators.edgeGqlObjectTypeGenerator.buildAndStore(flatObjectMetadata);
      generators.connectionGqlObjectTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
      );
      generators.groupByConnectionGqlObjectTypeGenerator.buildAndStore(
        flatObjectMetadata,
      );
      generators.relationConnectGqlInputTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
        context,
      );
      generators.objectMetadataGqlInputTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
        context,
      );

      if (this.objectContainsRelationOrMorphField(fields)) {
        generators.objectMetadataWithRelationsGqlObjectTypeGenerator.buildAndStore(
          flatObjectMetadata,
          fields,
          context,
        );
      }
    }
  }

  private objectContainsRelationOrMorphField(
    fields: FlatFieldMetadata[],
  ): boolean {
    return fields.some((field) =>
      isMorphOrRelationFieldMetadataType(field.type),
    );
  }
}
