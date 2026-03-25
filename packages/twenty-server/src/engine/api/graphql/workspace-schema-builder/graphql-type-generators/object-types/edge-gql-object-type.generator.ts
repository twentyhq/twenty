import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isInputObjectType } from 'graphql';
import { isDefined, pascalCase } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { CursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { applyTypeOptionsForOutputType } from 'src/engine/api/graphql/workspace-schema-builder/utils/apply-type-options-for-output-type.util';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class EdgeGqlObjectTypeGenerator {
  private readonly logger = new Logger(EdgeGqlObjectTypeGenerator.name);

  constructor(private readonly gqlTypesStorage: GqlTypesStorage) {}

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
      nullable: false as const,
    };

    fields.node = {
      type: applyTypeOptionsForOutputType(objectType, typeOptions),
    };

    fields.cursor = {
      type: applyTypeOptionsForOutputType(CursorScalarType, typeOptions),
    };

    return fields;
  }
}
