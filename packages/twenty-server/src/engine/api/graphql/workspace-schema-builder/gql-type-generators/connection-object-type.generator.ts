import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { StoredObjectType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/aggregation-type.generator';
import { PageInfoType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ConnectionObjectTypeGenerator {
  private readonly logger = new Logger(ConnectionObjectTypeGenerator.name);

  constructor(
    private readonly aggregationObjectTypeGenerator: AggregationObjectTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public generate(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): StoredObjectType {
    const kind = ObjectTypeDefinitionKind.Connection;

    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      kind,
    );

    return {
      key,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: () => this.generateFields(objectMetadata, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    const aggregatedFields =
      this.aggregationObjectTypeGenerator.generate(objectMetadata);

    Object.assign(fields, aggregatedFields);

    const edgeType = this.typeDefinitionsStorage.getObjectTypeByKey(
      computeObjectMetadataObjectTypeKey(
        objectMetadata.nameSingular,
        ObjectTypeDefinitionKind.Edge,
      ),
    );

    if (!isDefined(edgeType)) {
      this.logger.error(
        `Edge type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
        {
          objectMetadata,
          options,
        },
      );

      throw new Error(
        `Edge type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
      );
    }

    fields.edges = {
      type: this.typeMapperService.mapToGqlType(edgeType, {
        isArray: true,
        arrayDepth: 1,
        nullable: false,
      }),
    };

    fields.pageInfo = {
      type: this.typeMapperService.mapToGqlType(PageInfoType, {
        nullable: false,
      }),
    };

    return fields;
  }
}
