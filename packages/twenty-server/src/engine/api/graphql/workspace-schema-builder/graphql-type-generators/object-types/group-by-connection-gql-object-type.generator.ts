import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isObjectType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { isDefined } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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

  public buildAndStore(flatObjectMetadata: FlatObjectMetadata) {
    const kind = ObjectTypeDefinitionKind.GroupByConnection;

    const key = computeObjectMetadataObjectTypeKey(
      flatObjectMetadata.nameSingular,
      kind,
    );

    this.gqlTypesStorage.addGqlType(
      key,
      new GraphQLObjectType({
        name: `${pascalCase(flatObjectMetadata.nameSingular)}${kind.toString()}`,
        description: flatObjectMetadata.description,
        fields: () => this.generateFields(flatObjectMetadata.nameSingular),
      }),
    );
  }

  private generateFields(
    objectNameSingular: string,
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    const connection = this.gqlTypesStorage.getGqlTypeByKey(
      computeObjectMetadataObjectTypeKey(
        objectNameSingular,
        ObjectTypeDefinitionKind.Connection,
      ),
    );

    if (!isDefined(connection) || !isObjectType(connection)) {
      this.logger.error(
        `Connection type for ${objectNameSingular} was not found.`,
      );

      throw new Error(
        `Connection type for ${objectNameSingular} was not found.`,
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
