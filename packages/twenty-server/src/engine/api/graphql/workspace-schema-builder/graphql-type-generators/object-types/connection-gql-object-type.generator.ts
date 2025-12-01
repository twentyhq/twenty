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
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ConnectionGqlObjectTypeGenerator {
  private readonly logger = new Logger(ConnectionGqlObjectTypeGenerator.name);

  constructor(
    private readonly aggregationObjectTypeGenerator: AggregationObjectTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    flatFields: FlatFieldMetadata[],
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
        fields: () => this.generateFields(flatObjectMetadata, flatFields),
      }),
    );
  }

  private generateFields(
    flatObjectMetadata: FlatObjectMetadata,
    flatFields: FlatFieldMetadata[],
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    const aggregatedFields =
      this.aggregationObjectTypeGenerator.generate(flatFields);

    Object.assign(fields, aggregatedFields);

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
