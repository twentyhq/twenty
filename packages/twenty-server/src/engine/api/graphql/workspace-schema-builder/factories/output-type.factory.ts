import { Injectable, Logger } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';

import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

@Injectable()
export class OutputTypeFactory {
  private readonly logger = new Logger(OutputTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    target: string,
    type: FieldMetadataType,
    kind: ObjectTypeDefinitionKind,
    buildOptions: WorkspaceBuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLOutputType {
    let gqlType: GraphQLOutputType | undefined =
      this.typeMapperService.mapToScalarType(
        type,
        typeOptions.settings,
        typeOptions.isIdField,
      );

    gqlType ??= this.typeDefinitionsStorage.getOutputTypeByKey(target, kind);

    if (!gqlType) {
      this.logger.error(`Could not find a GraphQL type for ${target}`, {
        kind,
        type,
        buildOptions,
        typeOptions,
      });

      throw new Error(`Could not find a GraphQL type for ${target}`);
    }

    return this.typeMapperService.mapToGqlType(gqlType, typeOptions);
  }
}
