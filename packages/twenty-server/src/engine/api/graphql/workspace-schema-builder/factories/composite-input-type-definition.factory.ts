import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { computeCompositePropertyTarget } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-composite-property-target.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

import { InputTypeFactory } from './input-type.factory';

const hiddenAllowListKind = [
  InputTypeDefinitionKind.Create,
  InputTypeDefinitionKind.Update,
];

@Injectable()
export class CompositeInputTypeDefinitionFactory {
  private readonly logger = new Logger(
    CompositeInputTypeDefinitionFactory.name,
  );
  constructor(private readonly inputTypeFactory: InputTypeFactory) {}

  public create(
    compositeType: CompositeType,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): InputTypeDefinition {
    const name = pascalCase(compositeType.type.toString().toLowerCase());

    return {
      target: compositeType.type.toString(),
      kind,
      type: new GraphQLInputObjectType({
        name: `${pascalCase(name)}${kind.toString()}Input`,
        fields: this.generateFields(compositeType, kind, options),
      }),
    };
  }

  private generateFields(
    compositeType: CompositeType,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const property of compositeType.properties) {
      // Relation fields are not supported in composite types
      if (isRelationFieldMetadataType(property.type)) {
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

      const target = computeCompositePropertyTarget(
        compositeType.type,
        property,
      );
      const type = this.inputTypeFactory.create(
        target,
        property.type,
        kind,
        options,
        {
          nullable: !property.isRequired,
          isArray:
            property.type === FieldMetadataType.MULTI_SELECT ||
            property.isArray,
        },
      );

      fields[property.name] = {
        type,
        description: property.description,
      };
    }

    return fields;
  }
}
