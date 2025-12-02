import { Injectable } from '@nestjs/common';

import {
  GraphQLBoolean,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputType,
  GraphQLString,
} from 'graphql';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { getUniqueConstraintsFields, isDefined } from 'twenty-shared/utils';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class RelationConnectGqlInputTypeGenerator {
  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ) {
    const relationConnectGqlInputType = this.generateRelationConnectInputType(
      flatObjectMetadata,
      fields,
      context,
    );
    const key = computeRelationConnectInputTypeKey(flatObjectMetadata.id);

    this.gqlTypesStorage.addGqlType(key, relationConnectGqlInputType);
  }

  private generateRelationConnectInputType(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): GraphQLInputObjectType {
    return new GraphQLInputObjectType({
      name: `${pascalCase(flatObjectMetadata.nameSingular)}RelationInput`,
      fields: () => ({
        [RELATION_NESTED_QUERY_KEYWORDS.CONNECT]: {
          type: new GraphQLInputObjectType({
            name: `${pascalCase(flatObjectMetadata.nameSingular)}ConnectInput`,
            fields: this.generateRelationWhereInputType(
              flatObjectMetadata,
              fields,
              context,
            ),
          }),
          description: `Connect to a ${flatObjectMetadata.nameSingular} record`,
        },
        [RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]: {
          type: GraphQLBoolean,
          description: `Disconnect from a ${flatObjectMetadata.nameSingular} record`,
        },
      }),
    });
  }

  private generateRelationWhereInputType(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): Record<string, GraphQLInputFieldConfig> {
    const { flatIndexMaps } = context;

    const indexMetadatas = flatObjectMetadata.indexMetadataIds
      .map((indexId) => flatIndexMaps.byId[indexId])
      .filter(isDefined)
      .map((flatIndex) => ({
        id: flatIndex.id,
        isUnique: flatIndex.isUnique,
        indexFieldMetadatas: flatIndex.flatIndexFieldMetadatas,
      }));

    const objectWithIndexes = {
      id: flatObjectMetadata.id,
      indexMetadatas,
      fields,
    };

    const uniqueConstraints = getUniqueConstraintsFields<
      FlatFieldMetadata,
      typeof objectWithIndexes
    >(objectWithIndexes);

    const inputFields: Record<
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
              name: `${pascalCase(flatObjectMetadata.nameSingular)}${pascalCase(field.name)}WhereInput`,
              fields: () => compositeFields,
            });

            inputFields[field.name] = {
              type: compositeInputType,
              description: `Connect by ${field.label || field.name}`,
            };
          }
        } else {
          const scalarType = this.typeMapperService.mapToScalarType(
            field.type,
            { settings: field.settings, isIdField: field.name === 'id' },
          );

          inputFields[field.name] = {
            type: scalarType || GraphQLString,
            description: `Connect by ${field.label || field.name}`,
          };
        }
      });
    });

    return {
      [RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE]: {
        type: new GraphQLInputObjectType({
          name: `${pascalCase(flatObjectMetadata.nameSingular)}WhereUniqueInput`,
          fields: () => inputFields,
        }),
        description: `Find a ${flatObjectMetadata.nameSingular} record based on its unique fields: ${this.formatConstraints(uniqueConstraints)}`,
      },
    };
  }

  private formatConstraints(constraints: FlatFieldMetadata[][]) {
    return constraints
      .map((constraint) => constraint.map((field) => field.name).join(' and '))
      .join(' or ');
  }
}
