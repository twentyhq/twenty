import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLObjectType,
  GraphQLOutputType,
  isInputObjectType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { RelationFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/relation-field-metadata-gql-object-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeCompositeFieldObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-object-type-key.util';
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataGqlObjectTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataGqlObjectTypeGenerator.name,
  );

  constructor(
    private readonly relationFieldMetadataGqlObjectTypeGenerator: RelationFieldMetadataGqlObjectTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
  ) {
    const kind = ObjectTypeDefinitionKind.Plain;
    const key = computeObjectMetadataObjectTypeKey(
      flatObjectMetadata.nameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    this.gqlTypesStorage.addGqlType(
      key,
      new GraphQLObjectType({
        name: `${pascalCase(flatObjectMetadata.nameSingular)}${kind.toString()}`,
        description: flatObjectMetadata.description,
        fields: this.generateFields(flatObjectMetadata.nameSingular, fields),
      }),
    );
  }

  private generateFields(
    objectNameSingular: string,
    fields: FlatFieldMetadata[],
  ): GraphQLOutputTypeFieldConfigMap {
    const allGeneratedFields: GraphQLOutputTypeFieldConfigMap = {};

    for (const field of fields) {
      const typeFactoryOptions = {
        nullable: field.isNullable ?? undefined,
        isArray: field.type === FieldMetadataType.MULTI_SELECT,
        settings: field.settings,
        // Scalar type is already defined in the entity itself.
        isIdField: false,
      };

      if (isMorphOrRelationFlatFieldMetadata(field)) {
        const relationFieldObjectType =
          this.relationFieldMetadataGqlObjectTypeGenerator.generateRelationFieldObjectType(
            {
              fieldMetadata: field,
              typeOptions: typeFactoryOptions,
            },
          );

        Object.assign(allGeneratedFields, relationFieldObjectType);
        continue;
      }

      let type: GraphQLOutputType | undefined;

      if (isCompositeFieldMetadataType(field.type)) {
        const compositeFieldObjectTypeKey = computeCompositeFieldObjectTypeKey(
          field.type,
        );

        const compositeFieldObjectType = this.gqlTypesStorage.getGqlTypeByKey(
          compositeFieldObjectTypeKey,
        );

        if (
          !isDefined(compositeFieldObjectType) ||
          isInputObjectType(compositeFieldObjectType)
        ) {
          const message = `Could not find a GraphQL output type for ${field.name} composite field metadata of object ${objectNameSingular}`;

          this.logger.error(message, {
            type: field.type,
            typeOptions: typeFactoryOptions,
          });

          throw new Error(message);
        }

        type = compositeFieldObjectType;
      } else if (isEnumFieldMetadataType(field.type)) {
        const enumFieldEnumTypeKey = computeEnumFieldGqlTypeKey(
          objectNameSingular,
          field.name,
        );

        const enumFieldEnumType =
          this.gqlTypesStorage.getGqlTypeByKey(enumFieldEnumTypeKey);

        if (
          !isDefined(enumFieldEnumType) ||
          isInputObjectType(enumFieldEnumType)
        ) {
          const message = `Could not find a GraphQL output type for ${field.name} enum field metadata of object ${objectNameSingular}`;

          this.logger.error(message, {
            type: field.type,
            typeOptions: typeFactoryOptions,
          });

          throw new Error(message);
        }

        type = enumFieldEnumType;
      } else {
        type = this.typeMapperService.mapToScalarType(
          field.type,
          typeFactoryOptions,
        );

        if (!isDefined(type)) {
          const message = `Could not find a GraphQL output type for ${field.name} scalar field metadata of object ${objectNameSingular}`;

          this.logger.error(message, {
            type: field.type,
            typeOptions: typeFactoryOptions,
          });

          throw new Error(message);
        }
      }

      const modifiedType = this.typeMapperService.applyTypeOptions(
        type,
        typeFactoryOptions,
      );

      Object.assign(allGeneratedFields, {
        [field.name]: {
          type: modifiedType,
          description: field.description,
        },
      });
    }

    return allGeneratedFields;
  }
}
