import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigArgumentMap } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ArgsMetadata } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/param-metadata.interface';

import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';

@Injectable()
export class ArgsFactory {
  private readonly logger = new Logger(ArgsFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public create(
    { args, objectMetadataId }: ArgsMetadata,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigArgumentMap {
    const fieldConfigMap: GraphQLFieldConfigArgumentMap = {};

    for (const key in args) {
      // eslint-disable-next-line no-prototype-builtins
      if (!args.hasOwnProperty(key)) {
        continue;
      }
      const arg = args[key];

      // Argument is a scalar type
      if (arg.type) {
        const gqlType = this.typeMapperService.mapToGqlType(arg.type, {
          defaultValue: arg.defaultValue,
          nullable: arg.isNullable,
          isArray: arg.isArray,
        });

        fieldConfigMap[key] = {
          type: gqlType,
        };
      }

      // Argument is an input type
      if (arg.kind) {
        const inputType = this.typeDefinitionsStorage.getInputTypeByKey(
          objectMetadataId,
          arg.kind,
        );

        if (!inputType) {
          this.logger.error(
            `Could not find a GraphQL input type for ${objectMetadataId}`,
            {
              objectMetadataId,
              options,
            },
          );

          throw new Error(
            `Could not find a GraphQL input type for ${objectMetadataId}`,
          );
        }

        const gqlType = this.typeMapperService.mapToGqlType(inputType, {
          nullable: arg.isNullable,
          isArray: arg.isArray,
        });

        fieldConfigMap[key] = {
          type: gqlType,
        };
      }
    }

    return fieldConfigMap;
  }
}
