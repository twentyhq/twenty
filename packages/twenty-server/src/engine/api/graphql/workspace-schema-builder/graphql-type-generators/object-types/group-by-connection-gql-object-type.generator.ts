import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isObjectType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { isDefined } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class GroupByConnectionGqlObjectTypeGenerator {
  private readonly logger = new Logger(
    GroupByConnectionGqlObjectTypeGenerator.name,
  );

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const kind = ObjectTypeDefinitionKind.GroupByConnection;

    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      kind,
    );

    this.gqlTypesStorage.addGqlType(
      key,
      new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: () => this.generateFields(objectMetadata),
      }),
    );
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    const connection = this.gqlTypesStorage.getGqlTypeByKey(
      computeObjectMetadataObjectTypeKey(
        objectMetadata.nameSingular,
        ObjectTypeDefinitionKind.Connection,
      ),
    );

    if (!isDefined(connection) || !isObjectType(connection)) {
      this.logger.error(
        `Connection type for ${objectMetadata.nameSingular} was not found.`,
        {
          objectMetadata,
        },
      );

      throw new Error(
        `Connection type for ${objectMetadata.nameSingular} was not found.`,
      );
    }

    Object.assign(fields, connection.toConfig().fields);

    fields.groupByDimensionValues = {
      type: this.typeMapperService.applyTypeOptions(GraphQLJSON, {
        nullable: false,
      }),
    };

    return fields;
  }
}
