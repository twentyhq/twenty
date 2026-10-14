import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isInputObjectType, isObjectType } from 'graphql';
import { isDefined, pascalCase } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/aggregation-type.generator';
import { PageInfoType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { applyTypeOptionsForOutputType } from 'src/engine/api/graphql/workspace-schema-builder/utils/apply-type-options-for-output-type.util';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.type';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { isAggregatableThroughRelationFlatFieldMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-aggregatable-through-relation-flat-field-metadata.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const CONNECTION_RESERVED_FIELD_NAMES = ['edges', 'pageInfo'];

@Injectable()
export class ConnectionGqlObjectTypeGenerator {
  private readonly logger = new Logger(ConnectionGqlObjectTypeGenerator.name);

  constructor(
    private readonly aggregationObjectTypeGenerator: AggregationObjectTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    flatFields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ) {
    const kind = ObjectTypeDefinitionKind.Connection;

    const key = computeObjectMetadataObjectTypeKey(
      flatObjectMetadata.nameSingular,
      kind,
    );

    this.gqlTypesStorage.addGqlType(
      key,
      new GraphQLObjectType({
        name: `${pascalCase(flatObjectMetadata.nameSingular)}${kind.toString()}`,
        description: flatObjectMetadata.description,
        fields: () =>
          this.generateFields(flatObjectMetadata, flatFields, context),
      }),
    );
  }

  private generateFields(
    flatObjectMetadata: FlatObjectMetadata,
    flatFields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    const aggregatedFields =
      this.aggregationObjectTypeGenerator.generate(flatFields);

    Object.assign(fields, aggregatedFields);

    Object.assign(
      fields,
      this.generateAggregationThroughRelationFields({
        flatObjectMetadata,
        flatFields,
        context,
        reservedFieldNames: [
          ...Object.keys(aggregatedFields),
          ...CONNECTION_RESERVED_FIELD_NAMES,
        ],
      }),
    );

    const edgeType = this.gqlTypesStorage.getGqlTypeByKey(
      computeObjectMetadataObjectTypeKey(
        flatObjectMetadata.nameSingular,
        ObjectTypeDefinitionKind.Edge,
      ),
    );

    if (!isDefined(edgeType) || isInputObjectType(edgeType)) {
      this.logger.error(
        `Edge type for ${flatObjectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
      );

      throw new Error(
        `Edge type for ${flatObjectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
      );
    }

    fields.edges = {
      type: applyTypeOptionsForOutputType(edgeType, {
        isArray: true,
        arrayDepth: 1,
        nullable: false,
      }),
    };

    fields.pageInfo = {
      type: applyTypeOptionsForOutputType(PageInfoType, {
        nullable: false,
      }),
    };

    return fields;
  }

  // One field per plain many-to-one relation, typed with the target's shared Aggregation type
  private generateAggregationThroughRelationFields({
    flatObjectMetadata,
    flatFields,
    context,
    reservedFieldNames,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    flatFields: FlatFieldMetadata[];
    context: SchemaGenerationContext;
    reservedFieldNames: string[];
  }): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    for (const flatFieldMetadata of flatFields) {
      if (!isAggregatableThroughRelationFlatFieldMetadata(flatFieldMetadata)) {
        continue;
      }

      if (reservedFieldNames.includes(flatFieldMetadata.name)) {
        this.logger.debug(
          `Skipping aggregation through ${flatObjectMetadata.nameSingular}.${flatFieldMetadata.name}: the relation name collides with a connection field`,
        );
        continue;
      }

      const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: context.flatObjectMetadataMaps,
      });

      if (!isDefined(targetObjectMetadata)) {
        continue;
      }

      const aggregationType = this.gqlTypesStorage.getGqlTypeByKey(
        computeObjectMetadataObjectTypeKey(
          targetObjectMetadata.nameSingular,
          ObjectTypeDefinitionKind.Aggregation,
        ),
      );

      if (!isDefined(aggregationType) || !isObjectType(aggregationType)) {
        this.logger.debug(
          `Skipping aggregation through ${flatObjectMetadata.nameSingular}.${flatFieldMetadata.name}: no aggregation type for ${targetObjectMetadata.nameSingular}`,
        );
        continue;
      }

      fields[flatFieldMetadata.name] = {
        type: aggregationType,
        description: `Aggregations over the ${targetObjectMetadata.nameSingular} reached through ${flatFieldMetadata.name}`,
      };
    }

    return fields;
  }
}
