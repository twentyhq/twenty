import { Injectable, Logger } from '@nestjs/common';

import { type GraphQLFieldConfigArgumentMap } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { type ArgsMetadata } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/param-metadata.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';

@Injectable()
export class ArgsTypeGenerator {
  private readonly logger = new Logger(ArgsTypeGenerator.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public generate(
    { args, objectMetadataSingularName }: ArgsMetadata,
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
      if (isDefined(arg.type)) {
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
      if (isDefined(arg.kind)) {
        const storageKey = computeObjectMetadataInputTypeKey(
          objectMetadataSingularName,
          arg.kind,
        );

        const inputType =
          this.typeDefinitionsStorage.getInputTypeByKey(storageKey);

        if (!inputType) {
          this.logger.error(
            `Could not find a GraphQL input type for ${objectMetadataSingularName}`,
            {
              objectMetadataSingularName,
              options,
            },
          );

          throw new Error(
            `Could not find a GraphQL input type for ${objectMetadataSingularName}`,
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
