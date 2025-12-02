import { Injectable, Logger } from '@nestjs/common';

import {
  type CompositeType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { EnumFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/enum-field-metadata-gql-enum-type.generator';
import { CompositeFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/composite-field-metadata-gql-input-type.generator';
import { GroupByDateGranularityInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/group-by-date-granularity-gql-input-type.generator';
import { ObjectMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/object-metadata-gql-input-type.generator';
import { RelationConnectGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-connect-gql-input-type.generator';
import { CompositeFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/composite-field-metadata-gql-object-type.generator';
import { ConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/connection-gql-object-type.generator';
import { EdgeGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/edge-gql-object-type.generator';
import { GroupByConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/group-by-connection-gql-object-type.generator';
import { ObjectMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/object-metadata-gql-object-type.generator';
import { ObjectMetadataWithRelationsGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/object-metadata-with-relations-gql-object-type.generator';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/mutation-type.generator';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/query-type.generator';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

@Injectable()
export class GqlTypeGenerator {
  private readonly logger = new Logger(GqlTypeGenerator.name);

  constructor(
    private readonly objectMetadataGqlObjectTypeGenerator: ObjectMetadataGqlObjectTypeGenerator,
    private readonly objectMetadataGqlInputTypeGenerator: ObjectMetadataGqlInputTypeGenerator,
    private readonly compositeFieldMetadataGqlObjectTypeGenerator: CompositeFieldMetadataGqlObjectTypeGenerator,
    private readonly enumFieldMetadataGqlEnumTypeGenerator: EnumFieldMetadataGqlEnumTypeGenerator,
    private readonly compositeFieldMetadataGqlEnumTypeGenerator: CompositeFieldMetadataGqlEnumTypeGenerator,
    private readonly compositeFieldMetadataGqlInputTypeGenerator: CompositeFieldMetadataGqlInputTypeGenerator,
    private readonly edgeGqlObjectTypeGenerator: EdgeGqlObjectTypeGenerator,
    private readonly connectionGqlObjectTypeGenerator: ConnectionGqlObjectTypeGenerator,
    private readonly groupByConnectionGqlObjectTypeGenerator: GroupByConnectionGqlObjectTypeGenerator,
    private readonly objectMetadataWithRelationsGqlObjectTypeGenerator: ObjectMetadataWithRelationsGqlObjectTypeGenerator,
    private readonly relationConnectGqlInputTypeGenerator: RelationConnectGqlInputTypeGenerator,
    private readonly groupByDateGranularityInputTypeGenerator: GroupByDateGranularityInputTypeGenerator,
    private readonly queryTypeGenerator: QueryTypeGenerator,
    private readonly mutationTypeGenerator: MutationTypeGenerator,
  ) {}

  async buildAndStore(context: SchemaGenerationContext) {
    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.buildAndStoreCompositeFieldMetadataGqlTypes(compositeTypeCollection);
    this.buildAndStoreDateFieldMetadataGroupByGqlTypes();
    this.buildAndStoreObjectMetadataGqlTypes(context);
    await this.queryTypeGenerator.buildAndStore(context);
    this.mutationTypeGenerator.buildAndStore(context);
  }

  private buildAndStoreCompositeFieldMetadataGqlTypes(
    compositeTypes: CompositeType[],
  ) {
    for (const compositeType of compositeTypes) {
      this.compositeFieldMetadataGqlEnumTypeGenerator.buildAndStore(
        compositeType,
      );
      this.compositeFieldMetadataGqlObjectTypeGenerator.buildAndStore(
        compositeType,
      );
      this.compositeFieldMetadataGqlInputTypeGenerator.buildAndStore(
        compositeType,
      );
    }
  }

  private buildAndStoreDateFieldMetadataGroupByGqlTypes() {
    this.groupByDateGranularityInputTypeGenerator.buildAndStore();
  }

  private buildAndStoreObjectMetadataGqlTypes(
    context: SchemaGenerationContext,
  ) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } = context;
    const objectMetadataCollection = Object.values(
      flatObjectMetadataMaps.byId,
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

      this.enumFieldMetadataGqlEnumTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
      );
      this.objectMetadataGqlObjectTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
      );
      this.edgeGqlObjectTypeGenerator.buildAndStore(flatObjectMetadata);
      this.connectionGqlObjectTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
      );
      this.groupByConnectionGqlObjectTypeGenerator.buildAndStore(
        flatObjectMetadata,
      );
      this.relationConnectGqlInputTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
        context,
      );
      this.objectMetadataGqlInputTypeGenerator.buildAndStore(
        flatObjectMetadata,
        fields,
        context,
      );

      if (this.objectContainsRelationOrMorphField(fields)) {
        this.objectMetadataWithRelationsGqlObjectTypeGenerator.buildAndStore(
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
