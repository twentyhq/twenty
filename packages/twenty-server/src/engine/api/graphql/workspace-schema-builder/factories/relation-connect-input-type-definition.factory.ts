import { Injectable } from '@nestjs/common';

import {
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLString,
} from 'graphql';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getUniqueConstraintsFields } from 'src/engine/metadata-modules/index-metadata/utils/getUniqueConstraintsFields.util';
import { pascalCase } from 'src/utils/pascal-case';

export const formatRelationConnectInputTarget = (objectMetadataId: string) =>
  `${objectMetadataId}-connect-input`;

@Injectable()
export class RelationConnectInputTypeDefinitionFactory {
  constructor(private readonly typeMapperService: TypeMapperService) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
  ): InputTypeDefinition[] {
    const fields = this.generateRelationConnectInputType(objectMetadata);
    const target = formatRelationConnectInputTarget(objectMetadata.id);

    return [
      {
        target,
        kind: InputTypeDefinitionKind.Create,
        type: fields,
      },
    ];
  }

  private generateRelationConnectInputType(
    objectMetadata: ObjectMetadataInterface,
  ): GraphQLInputObjectType {
    return new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}RelationInput`,
      fields: () => ({
        connect: {
          type: new GraphQLInputObjectType({
            name: `${pascalCase(objectMetadata.nameSingular)}ConnectInput`,
            fields: this.generateRelationWhereInputType(objectMetadata),
          }),
          description: `Connect to a ${objectMetadata.nameSingular} record`,
        },
      }),
    });
  }

  private generateRelationWhereInputType(
    objectMetadata: ObjectMetadataInterface,
  ): Record<string, GraphQLInputFieldConfig> {
    const uniqueConstraints = getUniqueConstraintsFields<
      FieldMetadataEntity,
      ObjectMetadataInterface
    >(objectMetadata);

    const fields: Record<
      string,
      { type: GraphQLInputType; description: string }
    > = {};

    uniqueConstraints.forEach((constraint) => {
      constraint.forEach((field) => {
        if (isCompositeFieldMetadataType(field.type)) {
          const compositeType = compositeTypeDefinitions.get(field.type);

          if (!compositeType) {
            throw new Error(
              `Composite type definition not found for field type ${field.type}`,
            );
          }

          const uniqueProperties = compositeType.properties.filter(
            (property) => property.isIncludedInUniqueConstraint,
          );

          if (uniqueProperties.length > 0) {
            const compositeFields: Record<
              string,
              { type: GraphQLInputType; description: string }
            > = {};

            uniqueProperties.forEach((property) => {
              const scalarType = this.typeMapperService.mapToScalarType(
                property.type,
              );

              compositeFields[property.name] = {
                type: scalarType || GraphQLString,
                description: `Connect by ${property.name}`,
              };
            });

            const compositeInputType = new GraphQLInputObjectType({
              name: `${pascalCase(objectMetadata.nameSingular)}${pascalCase(field.name)}WhereInput`,
              fields: () => compositeFields,
            });

            fields[field.name] = {
              type: compositeInputType,
              description: `Connect by ${field.label || field.name}`,
            };
          }
        } else {
          const scalarType = this.typeMapperService.mapToScalarType(
            field.type,
            field.settings ?? undefined,
            field.name === 'id',
          );

          fields[field.name] = {
            type: scalarType || GraphQLString,
            description: `Connect by ${field.label || field.name}`,
          };
        }
      });
    });

    return {
      where: {
        type: new GraphQLInputObjectType({
          name: `${pascalCase(objectMetadata.nameSingular)}WhereUniqueInput`,
          fields: () => fields,
        }),
        description: `Find a ${objectMetadata.nameSingular} record based on its unique fields: ${this.formatConstraints(uniqueConstraints)}`,
      },
    };
  }

  private formatConstraints(constraints: FieldMetadataEntity[][]) {
    return constraints
      .map((constraint) => constraint.map((field) => field.name).join(' and '))
      .join(' or ');
  }
}
