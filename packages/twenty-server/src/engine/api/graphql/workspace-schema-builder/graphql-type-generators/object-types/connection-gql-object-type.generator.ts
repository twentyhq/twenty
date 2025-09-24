import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isInputObjectType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/aggregation-type.generator';
import { PageInfoType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ConnectionGqlObjectTypeGenerator {
  private readonly logger = new Logger(ConnectionGqlObjectTypeGenerator.name);

  constructor(
    private readonly aggregationObjectTypeGenerator: AggregationObjectTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const kind = ObjectTypeDefinitionKind.Connection;

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

    const aggregatedFields =
      this.aggregationObjectTypeGenerator.generate(objectMetadata);

    Object.assign(fields, aggregatedFields);

    const edgeType = this.gqlTypesStorage.getGqlTypeByKey(
      computeObjectMetadataObjectTypeKey(
        objectMetadata.nameSingular,
        ObjectTypeDefinitionKind.Edge,
      ),
    );

    if (!isDefined(edgeType) || isInputObjectType(edgeType)) {
      this.logger.error(
        `Edge type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
        {
          objectMetadata,
        },
      );

      throw new Error(
        `Edge type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
      );
    }

    fields.edges = {
      type: this.typeMapperService.applyTypeOptions(edgeType, {
        isArray: true,
        arrayDepth: 1,
        nullable: false,
      }),
    };

    fields.pageInfo = {
      type: this.typeMapperService.applyTypeOptions(PageInfoType, {
        nullable: false,
      }),
    };

    return fields;
  }
}
