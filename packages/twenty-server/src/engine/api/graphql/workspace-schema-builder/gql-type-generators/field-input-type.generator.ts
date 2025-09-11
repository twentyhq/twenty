import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/input-type-definition-kind.enum';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { createGqlEnumFilterType } from 'src/engine/api/graphql/workspace-schema-builder/utils/create-gql-enum-filter-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

@Injectable()
export class FieldInputTypeGenerator {
  private readonly logger = new Logger(FieldInputTypeGenerator.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  generate({
    type,
    kind,
    buildOptions,
    typeOptions,
    key,
  }: {
    type: FieldMetadataType;
    kind: InputTypeDefinitionKind;
    buildOptions: WorkspaceBuildSchemaOptions;
    typeOptions: TypeOptions;
    key?: string;
  }): GraphQLInputType {
    let inputType: GraphQLInputType | undefined;

    switch (kind) {
      /**
       * Create and Update input types are classic scalar types
       */
      case InputTypeDefinitionKind.Create:
      case InputTypeDefinitionKind.Update:
        inputType = isDefined(key)
          ? this.typeDefinitionsStorage.getEnumTypeByKey(key) ||
            this.typeDefinitionsStorage.getInputTypeByKey(key)
          : this.typeMapperService.mapToScalarType(
              type,
              typeOptions.settings,
              typeOptions.isIdField,
            );
        break;

      /**
       * Filter input maps to special filter type
       */
      case InputTypeDefinitionKind.Filter: {
        if (isEnumFieldMetadataType(type)) {
          if (!isDefined(key)) {
            this.logger.error(
              `Cache key is required for ${type} field metadata input type`,
            );

            throw new Error(
              `Cache key is required for ${type} field metadata input type`,
            );
          }

          const enumType = this.typeDefinitionsStorage.getEnumTypeByKey(key);

          if (!isDefined(enumType)) {
            this.logger.error(`Could not find a GraphQL enum type for ${key}`);
            throw new Error(`Could not find a GraphQL enum type for ${key}`);
          }

          inputType = createGqlEnumFilterType(enumType);
        } else {
          inputType = isDefined(key)
            ? this.typeDefinitionsStorage.getInputTypeByKey(key)
            : this.typeMapperService.mapToFilterType(
                type,
                typeOptions.settings,
                typeOptions.isIdField,
              );
        }

        break;
      }
      /**
       * OrderBy input maps to special order by type
       */
      case InputTypeDefinitionKind.OrderBy:
        inputType = isDefined(key)
          ? this.typeDefinitionsStorage.getEnumTypeByKey(key) ||
            this.typeDefinitionsStorage.getInputTypeByKey(key)
          : this.typeMapperService.mapToOrderByType(type);
        break;
    }

    if (!inputType) {
      this.logger.error(
        `Could not find a GraphQL type input for ${isDefined(key) ? key : `type: ${type} / kind: ${kind}`}`,
        {
          type,
          kind,
          buildOptions,
          typeOptions,
        },
      );

      throw new Error(
        `Could not find a GraphQL input type for ${isDefined(key) ? key : `type: ${type} / kind: ${kind}`}`,
      );
    }

    return this.typeMapperService.mapToGqlType(inputType, typeOptions);
  }
}
