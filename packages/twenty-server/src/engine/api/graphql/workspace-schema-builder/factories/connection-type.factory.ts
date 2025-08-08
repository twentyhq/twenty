import { Injectable, Logger } from '@nestjs/common';

import { type GraphQLOutputType } from 'graphql';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { PageInfoType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object';
import {
  TypeMapperService,
  type TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import { ConnectionTypeDefinitionKind } from './connection-type-definition.factory';
import { type ObjectTypeDefinitionKind } from './object-type-definition.factory';

@Injectable()
export class ConnectionTypeFactory {
  private readonly logger = new Logger(ConnectionTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    objectMetadata: ObjectMetadataEntity,
    kind: ConnectionTypeDefinitionKind,
    buildOptions: WorkspaceBuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLOutputType {
    if (kind === ConnectionTypeDefinitionKind.PageInfo) {
      return this.typeMapperService.mapToGqlType(PageInfoType, typeOptions);
    }

    const edgeType = this.typeDefinitionsStorage.getObjectTypeByKey(
      objectMetadata.id,
      kind as unknown as ObjectTypeDefinitionKind,
    );

    if (!edgeType) {
      this.logger.error(
        `Edge type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
        {
          objectMetadata,
          buildOptions,
        },
      );

      throw new Error(
        `Edge type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
      );
    }

    return this.typeMapperService.mapToGqlType(edgeType, typeOptions);
  }
}
