import { Injectable, Logger } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { customTableDefaultColumns } from 'src/engine/workspace-manager/workspace-migration-runner/utils/custom-table-default-column.util';
import { fullNameObjectDefinition } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { currencyObjectDefinition } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { linkObjectDefinition } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { EnumTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/enum-type-definition.factory';
import { addressObjectDefinition } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';

import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import {
  ObjectTypeDefinitionFactory,
  ObjectTypeDefinitionKind,
} from './factories/object-type-definition.factory';
import {
  InputTypeDefinitionFactory,
  InputTypeDefinitionKind,
} from './factories/input-type-definition.factory';
import { getFieldMetadataType } from './utils/get-field-metadata-type.util';
import { WorkspaceBuildSchemaOptions } from './interfaces/workspace-build-schema-optionts.interface';
import { FilterTypeDefinitionFactory } from './factories/filter-type-definition.factory';
import { ConnectionTypeDefinitionFactory } from './factories/connection-type-definition.factory';
import { EdgeTypeDefinitionFactory } from './factories/edge-type-definition.factory';
import { OrderByTypeDefinitionFactory } from './factories/order-by-type-definition.factory';
import { ExtendObjectTypeDefinitionFactory } from './factories/extend-object-type-definition.factory';
import { objectContainsRelationField } from './utils/object-contains-relation-field';

// Create a default field for each custom table default column
const defaultFields = customTableDefaultColumns.map((column) => {
  return {
    type: getFieldMetadataType(column.type),
    name: column.name,
    isNullable: true,
  } as FieldMetadataEntity;
});

@Injectable()
export class TypeDefinitionsGenerator {
  private readonly logger = new Logger(TypeDefinitionsGenerator.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly objectTypeDefinitionFactory: ObjectTypeDefinitionFactory,
    private readonly enumTypeDefinitionFactory: EnumTypeDefinitionFactory,
    private readonly inputTypeDefinitionFactory: InputTypeDefinitionFactory,
    private readonly filterTypeDefintionFactory: FilterTypeDefinitionFactory,
    private readonly orderByTypeDefinitionFactory: OrderByTypeDefinitionFactory,
    private readonly edgeTypeDefinitionFactory: EdgeTypeDefinitionFactory,
    private readonly connectionTypeDefinitionFactory: ConnectionTypeDefinitionFactory,
    private readonly extendObjectTypeDefinitionFactory: ExtendObjectTypeDefinitionFactory,
  ) {}

  generate(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    // Generate static objects first because they can be used in dynamic objects
    this.generateStaticObjectTypeDefs(options);
    // Generate dynamic objects
    this.generateDynamicObjectTypeDefs(objectMetadataCollection, options);
  }

  private generateStaticObjectTypeDefs(options: WorkspaceBuildSchemaOptions) {
    const staticObjectMetadataCollection = [
      currencyObjectDefinition,
      linkObjectDefinition,
      fullNameObjectDefinition,
      addressObjectDefinition,
    ] satisfies ObjectMetadataInterface[];

    this.logger.log(
      `Generating staticObjects: [${staticObjectMetadataCollection
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    // Generate static objects first because they can be used in dynamic objects
    this.generateEnumTypeDefs(staticObjectMetadataCollection, options);
    this.generateObjectTypeDefs(staticObjectMetadataCollection, options);
    this.generateInputTypeDefs(staticObjectMetadataCollection, options);
  }

  private generateDynamicObjectTypeDefs(
    dynamicObjectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    this.logger.log(
      `Generating dynamicObjects: [${dynamicObjectMetadataCollection
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
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const objectTypeDefs = objectMetadataCollection.map((objectMetadata) => {
      const fields = this.mergeFieldsWithDefaults(objectMetadata.fields);
      const extendedObjectMetadata = {
        ...objectMetadata,
        fields,
      };

      return this.objectTypeDefinitionFactory.create(
        extendedObjectMetadata,
        ObjectTypeDefinitionKind.Plain,
        options,
      );
    });

    this.typeDefinitionsStorage.addObjectTypes(objectTypeDefs);
  }

  private generatePaginationTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const edgeTypeDefs = objectMetadataCollection.map((objectMetadata) => {
      const fields = this.mergeFieldsWithDefaults(objectMetadata.fields);
      const extendedObjectMetadata = {
        ...objectMetadata,
        fields,
      };

      return this.edgeTypeDefinitionFactory.create(
        extendedObjectMetadata,
        options,
      );
    });

    this.typeDefinitionsStorage.addObjectTypes(edgeTypeDefs);

    // Connection type defs are using edge type defs
    const connectionTypeDefs = objectMetadataCollection.map(
      (objectMetadata) => {
        const fields = this.mergeFieldsWithDefaults(objectMetadata.fields);
        const extendedObjectMetadata = {
          ...objectMetadata,
          fields,
        };

        return this.connectionTypeDefinitionFactory.create(
          extendedObjectMetadata,
          options,
        );
      },
    );

    this.typeDefinitionsStorage.addObjectTypes(connectionTypeDefs);
  }

  private generateInputTypeDefs(
    objectMetadataCollection: ObjectMetadataInterface[],
    options: WorkspaceBuildSchemaOptions,
  ) {
    const inputTypeDefs = objectMetadataCollection
      .map((objectMetadata) => {
        const fields = this.mergeFieldsWithDefaults(objectMetadata.fields);
        const requiredExtendedObjectMetadata = {
          ...objectMetadata,
          fields,
        };
        const optionalExtendedObjectMetadata = {
          ...objectMetadata,
          fields: fields.map((field) => ({ ...field, isNullable: true })),
        };

        return [
          // Input type for create
          this.inputTypeDefinitionFactory.create(
            requiredExtendedObjectMetadata,
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
          this.filterTypeDefintionFactory.create(
            optionalExtendedObjectMetadata,
            options,
          ),
          // OrderBy input type
          this.orderByTypeDefinitionFactory.create(
            optionalExtendedObjectMetadata,
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

  private mergeFieldsWithDefaults(
    fields: FieldMetadataInterface[],
  ): FieldMetadataInterface[] {
    const fieldNames = new Set(fields.map((field) => field.name));

    const uniqueDefaultFields = defaultFields.filter(
      (defaultField) => !fieldNames.has(defaultField.name),
    );

    return [...fields, ...uniqueDefaultFields];
  }
}
