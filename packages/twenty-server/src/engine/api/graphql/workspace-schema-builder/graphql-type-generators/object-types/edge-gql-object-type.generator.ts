import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isInputObjectType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { CursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class EdgeGqlObjectTypeGenerator {
  private readonly logger = new Logger(EdgeGqlObjectTypeGenerator.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(flatObjectMetadata: FlatObjectMetadata) {
    const kind = ObjectTypeDefinitionKind.Edge;
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

    const key = computeObjectMetadataObjectTypeKey(
      objectNameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    const objectType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(objectType) || isInputObjectType(objectType)) {
      this.logger.error(
        `Node type for ${objectNameSingular} was not found. Please, check if you have defined it.`,
      );

      throw new Error(
        `Node type for ${objectNameSingular} was not found. Please, check if you have defined it.`,
      );
    }

    const typeOptions = {
      nullable: false,
    };

    fields.node = {
      type: this.typeMapperService.applyTypeOptions(objectType, typeOptions),
    };

    fields.cursor = {
      type: this.typeMapperService.applyTypeOptions(
        CursorScalarType,
        typeOptions,
      ),
    };

    return fields;
  }
}
