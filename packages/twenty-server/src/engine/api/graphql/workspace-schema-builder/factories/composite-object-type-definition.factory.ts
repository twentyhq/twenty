import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { OutputTypeFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/output-type.factory';
import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { computeCompositePropertyTarget } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-composite-property-target.util';

@Injectable()
export class CompositeObjectTypeDefinitionFactory {
  private readonly logger = new Logger(
    CompositeObjectTypeDefinitionFactory.name,
  );

  constructor(private readonly outputTypeFactory: OutputTypeFactory) {}

  public create(
    compositeType: CompositeType,
    options: WorkspaceBuildSchemaOptions,
  ): ObjectTypeDefinition {
    const name = pascalCase(compositeType.type.toString().toLowerCase());
    const kind = ObjectTypeDefinitionKind.Plain;

    return {
      target: compositeType.type.toString(),
      kind,
      type: new GraphQLObjectType({
        name: `${name}${kind.toString()}`,
        fields: this.generateFields(compositeType, kind, options),
      }),
    };
  }

  private generateFields(
    compositeType: CompositeType,
    kind: ObjectTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

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
      if (property.hidden === true || property.hidden === 'output') {
        continue;
      }

      const target = computeCompositePropertyTarget(
        compositeType.type,
        property,
      );
      const type = this.outputTypeFactory.create(
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
