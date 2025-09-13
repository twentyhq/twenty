import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { EnumFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/enum-types/enum-field-metadata-gql-enum-type.generator';
import { ExtendedObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/extended-object-metadata-object-type.generator';
import { CompositeFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/input-types/composite-field-metadata-gql-input-type.generator';
import { CompositeFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/composite-field-metadata-gql-object-type.generator';
import { ConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/connection-gql-object-type.generator';
import { EdgeGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/edge-gql-object-type.generator';
import { ObjectMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-types/object-metadata-gql-object-type.generator';
import { RelationConnectInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-connect-input-type.generator';
import { objectContainsMorphRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-morph-relation-field.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
    private readonly extendedObjectMetadataObjectTypeGenerator: ExtendedObjectMetadataObjectTypeGenerator,
    private readonly relationConnectInputTypeGenerator: RelationConnectInputTypeGenerator,
  ) {}

  async generate(objectMetadataCollection: ObjectMetadataEntity[]) {
    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.generateCompositeFieldMetadataGqlTypes(compositeTypeCollection);

    await this.generateObjectMetadataTypes(objectMetadataCollection);

    this.generateRelationConnectInputTypes(objectMetadataCollection);
  }

  private generateCompositeFieldMetadataGqlTypes(
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

  private async generateObjectMetadataTypes(
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

      this.objectMetadataGqlInputTypeGenerator.buildAndStore(objectMetadata);
    }

    await this.generateObjectMetadataInputTypes(
      dynamicObjectMetadataCollection,
      options,
    );
    await this.generateExtendedObjectTypes(
      dynamicObjectMetadataCollection,
      options,
    );
  }

  private async generateObjectMetadataInputTypes(
    objectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const objectMetadataInputTypes = objectMetadataCollection.flatMap(
      (objectMetadata) =>
        this.objectMetadataInputTypeGenerator.generate(objectMetadata, options),
    );

    this.typeDefinitionsStorage.addInputTypes(objectMetadataInputTypes);
  }

  private async generateExtendedObjectTypes(
    objectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    // Generate extended object type defs only for objects that contain relation fields
    const objectMetadataCollectionWithRelationFields =
      objectMetadataCollection.filter(
        (obj) =>
          objectContainsRelationField(obj) ||
          objectContainsMorphRelationField(obj),
      );
    const workspaceId =
      objectMetadataCollectionWithRelationFields[0]?.workspaceId;

    if (!isDefined(workspaceId)) {
      throw new Error('Workspace ID not found');
    }

    const objectTypes = objectMetadataCollectionWithRelationFields.map(
      (objectMetadata) =>
        this.extendedObjectMetadataObjectTypeGenerator.generate(
          objectMetadata,
          options,
          objectMetadataCollection,
        ),
    );

    this.typeDefinitionsStorage.addObjectTypes(objectTypes);
  }

  private generateRelationConnectInputTypes(
    objectMetadataCollection: ObjectMetadataEntity[],
  ) {
    const relationWhereInputTypes = objectMetadataCollection.map(
      (objectMetadata) =>
        this.relationConnectInputTypeGenerator.generate(objectMetadata),
    );

    this.typeDefinitionsStorage.addInputTypes(relationWhereInputTypes);
  }
}
