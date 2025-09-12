import { Injectable, Logger } from '@nestjs/common';

import { type GraphQLOutputType } from 'graphql';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  TypeMapperService,
  type TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

@Injectable()
export class FieldObjectTypeGenerator {
  private readonly logger = new Logger(FieldObjectTypeGenerator.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public generate({
    type,
    buildOptions,
    typeOptions,
    key,
  }: {
    type: FieldMetadataType;
    buildOptions: WorkspaceBuildSchemaOptions;
    typeOptions: TypeOptions;
    key?: string;
  }): GraphQLOutputType {
    const gqlType = isDefined(key)
      ? this.gqlTypesStorage.getGqlTypeByKey(key)
      : this.typeMapperService.mapToScalarType(
          type,
          typeOptions.settings,
          typeOptions.isIdField,
        );

    if (!gqlType) {
      this.logger.error(
        `Could not find a GraphQL type for ${isDefined(key) ? key : type}`,
        {
          type,
          buildOptions,
          typeOptions,
        },
      );

      throw new Error(
        `Could not find a GraphQL type for ${isDefined(key) ? key : type}`,
      );
    }

    return this.typeMapperService.applyTypeOptions(gqlType, typeOptions);
  }
}
