import { Injectable, Logger } from '@nestjs/common';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { EnumFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/enum-types/enum-field-metadata-gql-enum-type.generator';
import { CompositeFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/input-types/composite-field-metadata-gql-input-type.generator';
import { ObjectMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/input-types/object-metadata-gql-input-type.generator';
import { RelationConnectGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/input-types/relation-connect-gql-input-type.generator';
import { CompositeFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/composite-field-metadata-gql-object-type.generator';
import { ConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/connection-gql-object-type.generator';
import { EdgeGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/edge-gql-object-type.generator';
import { ObjectMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/object-metadata-gql-object-type.generator';
import { ObjectMetadataWithRelationsGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/object-metadata-with-relations-gql-object-type.generator';
import { objectContainsMorphRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-morph-relation-field.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

//tododo
//0 - Check renaming
//1 - all is called from this buildAndStore service - By Kind
//2 - in Schema generator, 1 build and store 2 fetch
//3 - One only storage for all
//4 - Rename Extended to Enrich With Relation
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
    private readonly objectMetadataWithRelationsGqlObjectTypeGenerator: ObjectMetadataWithRelationsGqlObjectTypeGenerator,
    private readonly relationConnectGqlInputTypeGenerator: RelationConnectGqlInputTypeGenerator,
  ) {}

  async buildAndStore(objectMetadataCollection: ObjectMetadataEntity[]) {
    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.buildAndStoreCompositeFieldMetadataGqlTypes(compositeTypeCollection);

    await this.buildAndStoreObjectMetadataGqlTypes(objectMetadataCollection);
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

  private async buildAndStoreObjectMetadataGqlTypes(
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
