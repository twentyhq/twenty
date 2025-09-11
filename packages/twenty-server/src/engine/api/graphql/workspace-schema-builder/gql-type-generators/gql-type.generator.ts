import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { CompositeFieldEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-enum-type.generator';
import { CompositeFieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-input-type.generator';
import { CompositeFieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-object-type.generator';
import { ConnectionObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/connection-object-type.generator';
import { EdgeObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/edge-object-type.generator';
import { EnumFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/enum-field-type.generator';
import { ExtendedObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/extended-object-metadata-object-type.generator';
import { ObjectMetadataInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-metadata-input-type.generator';
import { ObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-metadata-object-type.generator';
import { RelationConnectInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-connect-input-type.generator';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { objectContainsMorphRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-morph-relation-field.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class GqlTypeGenerator {
  private readonly logger = new Logger(GqlTypeGenerator.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly objectMetadataObjectTypeGenerator: ObjectMetadataObjectTypeGenerator,
    private readonly objectMetadataInputTypeGenerator: ObjectMetadataInputTypeGenerator,
    private readonly compositeFieldObjectTypeGenerator: CompositeFieldObjectTypeGenerator,
    private readonly enumFieldTypeGenerator: EnumFieldTypeGenerator,
    private readonly compositeFieldEnumTypeGenerator: CompositeFieldEnumTypeGenerator,
    private readonly compositeFieldInputTypeGenerator: CompositeFieldInputTypeGenerator,
    private readonly edgeObjectTypeGenerator: EdgeObjectTypeGenerator,
    private readonly connectionObjectTypeGenerator: ConnectionObjectTypeGenerator,
    private readonly extendedObjectMetadataObjectTypeGenerator: ExtendedObjectMetadataObjectTypeGenerator,
    private readonly relationConnectInputTypeGenerator: RelationConnectInputTypeGenerator,
  ) {}

  async generate(
    objectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    // Generate composite type objects first because they can be used in dynamic objects
    await this.generateCompositeFieldTypes(options);
    // Generate metadata objects
    await this.generateObjectMetadataTypes(objectMetadataCollection, options);

    this.generateRelationConnectInputTypes(objectMetadataCollection);
  }

  /**
   * GENERATE COMPOSITE TYPE OBJECTS
   */
  private async generateCompositeFieldTypes(
    options: WorkspaceBuildSchemaOptions,
  ) {
    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.logger.log(
      `Generating composite type objects: [${compositeTypeCollection
        .map((compositeType) => compositeType.type)
        .join(', ')}]`,
    );

    // Generate composite types first because they can be used in metadata objects
    this.generateCompositeFieldEnumTypes(compositeTypeCollection, options);
    this.generateCompositeFieldObjectTypes(compositeTypeCollection, options);
    this.generateCompositeFieldInputTypes(compositeTypeCollection, options);
  }

  private generateCompositeFieldEnumTypes(
    compositeTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const enumTypes = compositeTypes
      .map((compositeType) =>
        this.compositeFieldEnumTypeGenerator.create(compositeType, options),
      )
      .flat();

    this.typeDefinitionsStorage.addEnumTypes(enumTypes);
  }

  private generateCompositeFieldObjectTypes(
    compositeTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const compositeObjectTypeDefs = compositeTypes.map((compositeType) =>
      this.compositeFieldObjectTypeGenerator.generate(compositeType, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(compositeObjectTypeDefs);
  }

  private generateCompositeFieldInputTypes(
    compositeTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const compositeFieldInputTypes =
      this.compositeFieldInputTypeGenerator.generate(compositeTypes, options);

    this.typeDefinitionsStorage.addInputTypes(compositeFieldInputTypes);
  }

  /**
   * GENERATE METADATA OBJECTS
   */

  private async generateObjectMetadataTypes(
    dynamicObjectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    this.logger.log(
      `Generating metadata objects: [${dynamicObjectMetadataCollection
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    // Generate dynamic objects
    this.generateEnumFieldTypes(dynamicObjectMetadataCollection, options);
    this.generateObjectMetadataOutputTypes(
      dynamicObjectMetadataCollection,
      options,
    );
    this.generatePaginationObjectTypes(
      dynamicObjectMetadataCollection,
      options,
    );
    await this.generateObjectMetadataInputTypes(
      dynamicObjectMetadataCollection,
      options,
    );
    await this.generateExtendedObjectTypes(
      dynamicObjectMetadataCollection,
      options,
    );
  }

  private generateObjectMetadataOutputTypes(
    objectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const objectMetadataObjectTypes = objectMetadataCollection.map(
      (objectMetadata) =>
        this.objectMetadataObjectTypeGenerator.generate(
          objectMetadata,
          options,
        ),
    );

    this.typeDefinitionsStorage.addObjectTypes(objectMetadataObjectTypes);
  }

  private generatePaginationObjectTypes(
    objectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const edgeObjectTypes = objectMetadataCollection.map((objectMetadata) =>
      this.edgeObjectTypeGenerator.generate(objectMetadata, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(edgeObjectTypes);

    // Connection types are using edge types
    const connectionObjectTypes = objectMetadataCollection.map(
      (objectMetadata) =>
        this.connectionObjectTypeGenerator.generate(objectMetadata, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(connectionObjectTypes);
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

  private generateEnumFieldTypes(
    objectMetadataCollection: ObjectMetadataEntity[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const enumFieldTypes = objectMetadataCollection
      .map((objectMetadata) =>
        this.enumFieldTypeGenerator.generate(objectMetadata, options),
      )
      .flat();

    this.typeDefinitionsStorage.addEnumTypes(enumFieldTypes);
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
