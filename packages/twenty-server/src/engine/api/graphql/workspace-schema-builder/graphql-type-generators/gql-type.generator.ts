import { Injectable, Logger } from '@nestjs/common';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { EnumFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/enum-field-metadata-gql-enum-type.generator';
import { CompositeFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/composite-field-metadata-gql-input-type.generator';
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
import { objectContainsMorphRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-morph-relation-field.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
    private readonly queryTypeGenerator: QueryTypeGenerator,
    private readonly mutationTypeGenerator: MutationTypeGenerator,
  ) {}

  async buildAndStore(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceId: string,
  ) {
    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.buildAndStoreCompositeFieldMetadataGqlTypes(compositeTypeCollection);
    this.buildAndStoreObjectMetadataGqlTypes(objectMetadataCollection);
    await this.queryTypeGenerator.buildAndStore(
      objectMetadataCollection,
      workspaceId,
    );
    this.mutationTypeGenerator.buildAndStore(objectMetadataCollection);
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

  private buildAndStoreObjectMetadataGqlTypes(
    dynamicObjectMetadataCollection: ObjectMetadataEntity[],
  ) {
    this.logger.log(
      `Generating metadata objects: [${dynamicObjectMetadataCollection
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    for (const objectMetadata of dynamicObjectMetadataCollection) {
      this.enumFieldMetadataGqlEnumTypeGenerator.buildAndStore(objectMetadata);
      this.objectMetadataGqlObjectTypeGenerator.buildAndStore(objectMetadata);
      this.edgeGqlObjectTypeGenerator.buildAndStore(objectMetadata);
      this.connectionGqlObjectTypeGenerator.buildAndStore(objectMetadata);
      this.groupByConnectionGqlObjectTypeGenerator.buildAndStore(
        objectMetadata,
      );
      this.relationConnectGqlInputTypeGenerator.buildAndStore(objectMetadata);
      this.objectMetadataGqlInputTypeGenerator.buildAndStore(objectMetadata);

      if (
        objectContainsRelationField(objectMetadata) ||
        objectContainsMorphRelationField(objectMetadata)
      )
        this.objectMetadataWithRelationsGqlObjectTypeGenerator.buildAndStore(
          objectMetadata,
          dynamicObjectMetadataCollection,
        );
    }
  }
}
