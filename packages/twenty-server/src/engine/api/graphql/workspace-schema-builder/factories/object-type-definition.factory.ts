import { Injectable } from '@nestjs/common';

import {
  GraphQLFieldConfigMap,
  GraphQLObjectType,
  GraphQLOutputType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { StoredObjectType } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-object-type-definition.factory';
import { FieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-object-type.generator';
import { RelationFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-field-type.generator';
import { computeCompositeFieldObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-object-type-key.util';
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

export type GraphQLOutputTypeFieldConfigMap = GraphQLFieldConfigMap<
  string,
  {
    type: GraphQLOutputType;
    description: string | null;
  }
>;

@Injectable()
export class ObjectMetadataObjectTypeGenerator {
  constructor(
    private readonly relationFieldTypeGenerator: RelationFieldTypeGenerator,
    private readonly fieldObjectTypeGenerator: FieldObjectTypeGenerator,
  ) {}

  public generate(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): StoredObjectType {
    const kind = ObjectTypeDefinitionKind.Plain;
    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    return {
      key,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: this.generateFields({
          objectMetadata,
          options,
        }),
      }),
    };
  }

  private generateFields({
    objectMetadata,
    options,
  }: {
    objectMetadata: ObjectMetadataEntity;
    options: WorkspaceBuildSchemaOptions;
  }): GraphQLOutputTypeFieldConfigMap {
    const allGeneratedFields = {};
    let key: string | undefined;

    for (const field of objectMetadata.fields) {
      key = undefined;

      const typeFactoryOptions = {
        nullable: field.isNullable ?? undefined,
        isArray: field.type === FieldMetadataType.MULTI_SELECT,
        settings: field.settings,
        // Scalar type is already defined in the entity itself.
        isIdField: false,
      };

      if (isMorphOrRelationFieldMetadataType(field.type)) {
        const relationFieldObjectType =
          this.relationFieldTypeGenerator.generateRelationFieldObjectType({
            fieldMetadata: field as FieldMetadataEntity<
              FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
            >,
            buildOptions: options,
            typeOptions: typeFactoryOptions,
          });

        Object.assign(allGeneratedFields, relationFieldObjectType);
        continue;
      }

      if (isCompositeFieldMetadataType(field.type))
        key = computeCompositeFieldObjectTypeKey(field.type);
      if (isEnumFieldMetadataType(field.type))
        key = computeEnumFieldGqlTypeKey(
          objectMetadata.nameSingular,
          field.name,
        );

      const type = this.fieldObjectTypeGenerator.generate({
        type: field.type,
        buildOptions: options,
        typeOptions: typeFactoryOptions,
        key,
      });

      Object.assign(allGeneratedFields, {
        [field.name]: {
          type,
          description: field.description,
        },
      });
    }

    return allGeneratedFields;
  }
}
