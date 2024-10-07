import { Injectable, Logger } from '@nestjs/common';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { CompositeEnumTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-enum-type-definition.factory';
import { CompositeInputTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-input-type-definition.factory';
import { CompositeObjectTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-object-type-definition.factory';
import { EnumTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/enum-type-definition.factory';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';

import { ConnectionTypeDefinitionFactory } from './factories/connection-type-definition.factory';
import { EdgeTypeDefinitionFactory } from './factories/edge-type-definition.factory';
import { ExtendObjectTypeDefinitionFactory } from './factories/extend-object-type-definition.factory';
import {
  InputTypeDefinitionFactory,
  InputTypeDefinitionKind,
} from './factories/input-type-definition.factory';
import {
  ObjectTypeDefinitionFactory,
  ObjectTypeDefinitionKind,
} from './factories/object-type-definition.factory';
import { WorkspaceBuildSchemaOptions } from './interfaces/workspace-build-schema-optionts.interface';
import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import { objectContainsRelationField } from './utils/object-contains-relation-field';

@Injectable()
export class TypeDefinitionsGenerator {
  private readonly logger = new Logger(TypeDefinitionsGenerator.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly objectTypeDefinitionFactory: ObjectTypeDefinitionFactory,
    private readonly compositeObjectTypeDefinitionFactory: CompositeObjectTypeDefinitionFactory,
    private readonly enumTypeDefinitionFactory: EnumTypeDefinitionFactory,
    private readonly compositeEnumTypeDefinitionFactory: CompositeEnumTypeDefinitionFactory,
    private readonly inputTypeDefinitionFactory: InputTypeDefinitionFactory,
    private readonly compositeInputTypeDefinitionFactory: CompositeInputTypeDefinitionFactory,
    private readonly edgeTypeDefinitionFactory: EdgeTypeDefinitionFactory,
    private readonly connectionTypeDefinitionFactory: ConnectionTypeDefinitionFactory,
    private readonly extendObjectTypeDefinitionFactory: ExtendObjectTypeDefinitionFactory,
  ) {}

  generate(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    // Generate composite type objects first because they can be used in dynamic objects
    this.generateCompositeTypeDefs(options);
    // Generate metadata objects
    this.generateMetadataTypeDefs(objectMetadataCollection, options);
  }

  /**
   * GENERATE COMPOSITE TYPE OBJECTS
   */
  private generateCompositeTypeDefs(options: WorkspaceBuildSchemaOptions) {
    const compositeTypeCollection = [...compositeTypeDefinitions.values()];

    this.logger.log(
      `Generating composite type objects: [${compositeTypeCollection
        .map((compositeType) => compositeType.type)
        .join(', ')}]`,
    );

    // Generate composite types first because they can be used in metadata objects
    this.generateCompositeEnumTypeDefs(compositeTypeCollection, options);
    this.generateCompositeObjectTypeDefs(compositeTypeCollection, options);
    this.generateCompositeInputTypeDefs(compositeTypeCollection, options);
  }

  private generateCompositeEnumTypeDefs(
    compositeTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const enumTypeDefs = compositeTypes
      .map((compositeType) =>
        this.compositeEnumTypeDefinitionFactory.create(compositeType, options),
      )
      .flat();

    this.typeDefinitionsStorage.addEnumTypes(enumTypeDefs);
  }

  private generateCompositeObjectTypeDefs(
    compositeTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const compositeObjectTypeDefs = compositeTypes.map((compositeType) =>
      this.compositeObjectTypeDefinitionFactory.create(compositeType, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(compositeObjectTypeDefs);
  }

  private generateCompositeInputTypeDefs(
    compisteTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const inputTypeDefs = compisteTypes
      .map((compositeType) => {
        const optionalExtendedObjectMetadata = {
          ...compositeType,
          properties: compositeType.properties.map((property) => ({
            ...property,
            isRequired: false,
          })),
        };

        return [
          // Input type for create
          this.compositeInputTypeDefinitionFactory.create(
            compositeType,
            InputTypeDefinitionKind.Create,
            options,
          ),
          // Input type for update
          this.compositeInputTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
            InputTypeDefinitionKind.Update,
            options,
          ),
          // Filter input type
          this.compositeInputTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
            InputTypeDefinitionKind.Filter,
            options,
          ),
          // OrderBy input type
          this.compositeInputTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
            InputTypeDefinitionKind.OrderBy,
            options,
          ),
        ];
      })
      .flat();

    this.typeDefinitionsStorage.addInputTypes(inputTypeDefs);
  }

  /**
   * GENERATE METADATA OBJECTS
   */

  private generateMetadataTypeDefs(
    dynamicObjectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    this.logger.log(
      `Generating metadata objects: [${dynamicObjectMetadataCollection
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    // Generate dynamic objects
    this.generateEnumTypeDefs(dynamicObjectMetadataCollection, options);
    this.generateObjectTypeDefs(dynamicObjectMetadataCollection, options);
    this.generatePaginationTypeDefs(dynamicObjectMetadataCollection, options);
    this.generateInputTypeDefs(dynamicObjectMetadataCollection, options);
    this.generateExtendedObjectTypeDefs(
      dynamicObjectMetadataCollection,
      options,
    );
  }

  private generateObjectTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[] | CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const objectTypeDefs = objectMetadataCollection.map((objectMetadata) =>
      this.objectTypeDefinitionFactory.create(
        objectMetadata,
        ObjectTypeDefinitionKind.Plain,
        options,
      ),
    );

    this.typeDefinitionsStorage.addObjectTypes(objectTypeDefs);
  }

  private generatePaginationTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const edgeTypeDefs = objectMetadataCollection.map((objectMetadata) =>
      this.edgeTypeDefinitionFactory.create(objectMetadata, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(edgeTypeDefs);

    // Connection type defs are using edge type defs
    const connectionTypeDefs = objectMetadataCollection.map((objectMetadata) =>
      this.connectionTypeDefinitionFactory.create(objectMetadata, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(connectionTypeDefs);
  }

  private generateInputTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const inputTypeDefs = objectMetadataCollection
      .map((objectMetadata) => {
        const optionalExtendedObjectMetadata = {
          ...objectMetadata,
          fields: objectMetadata.fields.map((field) => ({
            ...field,
            isNullable: true,
          })),
        };

        return [
          // Input type for create
          this.inputTypeDefinitionFactory.create(
            objectMetadata,
            InputTypeDefinitionKind.Create,
            options,
          ),
          // Input type for update
          this.inputTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
            InputTypeDefinitionKind.Update,
            options,
          ),
          // Filter input type
          this.inputTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
            InputTypeDefinitionKind.Filter,
            options,
          ),
          // OrderBy input type
          this.inputTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
            InputTypeDefinitionKind.OrderBy,
            options,
          ),
        ];
      })
      .flat();

    this.typeDefinitionsStorage.addInputTypes(inputTypeDefs);
  }

  private generateEnumTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const enumTypeDefs = objectMetadataCollection
      .map((objectMetadata) =>
        this.enumTypeDefinitionFactory.create(objectMetadata, options),
      )
      .flat();

    this.typeDefinitionsStorage.addEnumTypes(enumTypeDefs);
  }

  private generateExtendedObjectTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    // Generate extended object type defs only for objects that contain composite fields
    const objectMetadataCollectionWithCompositeFields =
      objectMetadataCollection.filter(objectContainsRelationField);
    const objectTypeDefs = objectMetadataCollectionWithCompositeFields.map(
      (objectMetadata) =>
        this.extendObjectTypeDefinitionFactory.create(objectMetadata, options),
    );

    this.typeDefinitionsStorage.addObjectTypes(objectTypeDefs);
  }
}
