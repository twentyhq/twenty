import { Injectable, Logger } from '@nestjs/common';

import { type GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { StoredGqlType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { FieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-object-type.generator';
import { computeCompositeFieldEnumTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-enum-type-key.util';
import { computeCompositeFieldObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-object-type-key.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

export interface StoredObjectType extends StoredGqlType<GraphQLObjectType> {}

@Injectable()
export class CompositeFieldObjectTypeGenerator {
  private readonly logger = new Logger(CompositeFieldObjectTypeGenerator.name);

  constructor(
    private readonly fieldObjectTypeGenerator: FieldObjectTypeGenerator,
  ) {}

  public generate(
    compositeType: CompositeType,
    options: WorkspaceBuildSchemaOptions,
  ): StoredObjectType {
    const kind = ObjectTypeDefinitionKind.Plain;
    const key = computeCompositeFieldObjectTypeKey(compositeType.type);

    return {
      key,
      type: new GraphQLObjectType({
        name: `${pascalCase(compositeType.type)}${kind.toString()}`,
        fields: this.generateFields(compositeType, options),
      }),
    };
  }

  private generateFields(
    compositeType: CompositeType,
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

      const type = this.fieldObjectTypeGenerator.generate({
        key: isEnumFieldMetadataType(property.type)
          ? computeCompositeFieldEnumTypeKey(compositeType.type, property.name)
          : undefined,
        type: property.type,
        buildOptions: options,
        typeOptions: {
          nullable: !property.isRequired,
          isArray:
            property.type === FieldMetadataType.MULTI_SELECT ||
            property.isArray,
        },
      });

      fields[property.name] = {
        type,
        description: property.description,
      };
    }

    return fields;
  }
}
