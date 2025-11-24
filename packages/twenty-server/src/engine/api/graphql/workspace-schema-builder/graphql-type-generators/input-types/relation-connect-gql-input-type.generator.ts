import { Injectable } from '@nestjs/common';

import {
  GraphQLBoolean,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputType,
  GraphQLString,
} from 'graphql';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { getUniqueConstraintsFields } from 'twenty-shared/utils';
import { compositeTypeDefinitions } from 'twenty-shared/types';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class RelationConnectGqlInputTypeGenerator {
  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const relationConnectGqlInputType =
      this.generateRelationConnectInputType(objectMetadata);
    const key = computeRelationConnectInputTypeKey(objectMetadata.id);

    this.gqlTypesStorage.addGqlType(key, relationConnectGqlInputType);
  }

  private generateRelationConnectInputType(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputObjectType {
    return new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}RelationInput`,
      fields: () => ({
        [RELATION_NESTED_QUERY_KEYWORDS.CONNECT]: {
          type: new GraphQLInputObjectType({
            name: `${pascalCase(objectMetadata.nameSingular)}ConnectInput`,
            fields: this.generateRelationWhereInputType(objectMetadata),
          }),
          description: `Connect to a ${objectMetadata.nameSingular} record`,
        },
        [RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]: {
          type: GraphQLBoolean,
          description: `Disconnect from a ${objectMetadata.nameSingular} record`,
        },
      }),
    });
  }

  private generateRelationWhereInputType(
    objectMetadata: ObjectMetadataEntity,
  ): Record<string, GraphQLInputFieldConfig> {
    const uniqueConstraints = getUniqueConstraintsFields<
      FieldMetadataEntity,
      ObjectMetadataEntity
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
            { settings: field.settings, isIdField: field.name === 'id' },
          );

          fields[field.name] = {
            type: scalarType || GraphQLString,
            description: `Connect by ${field.label || field.name}`,
          };
        }
      });
    });

    return {
      [RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE]: {
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
