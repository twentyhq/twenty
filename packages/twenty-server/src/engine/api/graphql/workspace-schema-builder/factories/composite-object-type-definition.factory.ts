import { Injectable, Logger } from '@nestjs/common';

import { type GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import {
  type ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { OutputTypeFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/output-type.factory';
import { computeCompositePropertyTarget } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-composite-property-target.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): GraphQLFieldConfigMap<any, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: GraphQLFieldConfigMap<any, any> = {};

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
