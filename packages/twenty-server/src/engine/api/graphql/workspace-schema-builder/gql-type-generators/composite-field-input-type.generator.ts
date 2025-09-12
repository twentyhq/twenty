import { Injectable, Logger } from '@nestjs/common';

import {
  type GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { StoredInputType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { FieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-input-type.generator';
import { computeCompositeFieldEnumTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-enum-type-key.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

const hiddenAllowListKind = [
  GqlInputTypeDefinitionKind.Create,
  GqlInputTypeDefinitionKind.Update,
];

@Injectable()
export class CompositeFieldInputTypeGenerator {
  private readonly logger = new Logger(CompositeFieldInputTypeGenerator.name);
  constructor(
    private readonly fieldInputTypeGenerator: FieldInputTypeGenerator,
  ) {}

  public generate(
    compositeTypes: CompositeType[],
    options: WorkspaceBuildSchemaOptions,
  ): StoredInputType[] {
    const storedCompositeFieldInputTypes: StoredInputType[] = [];

    for (const compositeType of compositeTypes) {
      const optionalCompositeType = {
        ...compositeType,
        properties: compositeType.properties.map((property) => ({
          ...property,
          isRequired: false,
        })),
      };

      for (const kind of Object.values(GqlInputTypeDefinitionKind)) {
        const storedCompositeFieldInputType = this.create(
          kind === GqlInputTypeDefinitionKind.Create
            ? compositeType
            : optionalCompositeType,
          kind,
          options,
        );

        storedCompositeFieldInputTypes.push(storedCompositeFieldInputType);
      }
    }

    return storedCompositeFieldInputTypes;
  }

  public create(
    compositeType: CompositeType,
    kind: GqlInputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): StoredInputType {
    const key = computeCompositeFieldInputTypeKey(compositeType.type, kind);

    return {
      key,
      type: new GraphQLInputObjectType({
        name: `${pascalCase(compositeType.type)}${kind.toString()}Input`,
        fields: this.generateFields(compositeType, kind, options),
      }),
    };
  }

  private generateFields(
    compositeType: CompositeType,
    kind: GqlInputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const property of compositeType.properties) {
      // Relation fields are not supported in composite types
      if (isMorphOrRelationFieldMetadataType(property.type)) {
        this.logger.error(
          'Relation fields are not supported in composite types',
          { compositeType, property },
        );

        throw new Error('Relation fields are not supported in composite types');
      }

      // Skip hidden fields
      if (
        property.hidden === true ||
        (property.hidden === 'input' && hiddenAllowListKind.includes(kind))
      ) {
        continue;
      }

      const type = this.fieldInputTypeGenerator.generate({
        type: property.type,
        kind,
        buildOptions: options,
        typeOptions: {
          nullable: !property.isRequired,
          isArray:
            property.type === FieldMetadataType.MULTI_SELECT ||
            property.isArray,
        },
        key: isEnumFieldMetadataType(property.type)
          ? computeCompositeFieldEnumTypeKey(compositeType.type, property.name)
          : undefined,
      });

      fields[property.name] = {
        type,
        description: property.description,
      };
    }

    return fields;
  }
}
