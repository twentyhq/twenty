import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';

import { FilterIs } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

import { InputTypeDefinitionKind } from './input-type-definition.factory';

@Injectable()
export class InputTypeFactory {
  private readonly logger = new Logger(InputTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    target: string,
    type: FieldMetadataType,
    kind: InputTypeDefinitionKind,
    buildOptions: WorkspaceBuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLInputType {
    let inputType: GraphQLInputType | undefined;

    switch (kind) {
      /**
       * Create and Update input types are classic scalar types
       */
      case InputTypeDefinitionKind.Create:
      case InputTypeDefinitionKind.Update:
        inputType = this.typeMapperService.mapToScalarType(
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
          inputType = this.createEnumFilterType(target);
        } else {
          inputType = this.typeMapperService.mapToFilterType(
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
        inputType = this.typeMapperService.mapToOrderByType(type);
        break;
    }

    /**
     * If input type is not scalar, we're looking for it in the type definitions storage as it can be an object type
     */
    inputType ??= this.typeDefinitionsStorage.getInputTypeByKey(target, kind);

    if (!inputType) {
      this.logger.error(`Could not find a GraphQL type for ${target}`, {
        type,
        kind,
        buildOptions,
        typeOptions,
      });

      throw new Error(`Could not find a GraphQL type for ${target}`);
    }

    return this.typeMapperService.mapToGqlType(inputType, typeOptions);
  }

  private createEnumFilterType(target: string): GraphQLInputObjectType {
    const enumType = this.typeDefinitionsStorage.getEnumTypeByKey(target);

    if (!enumType) {
      this.logger.error(`Could not find a GraphQL enum type for ${target}`);

      throw new Error(`Could not find a GraphQL enum type for ${target}`);
    }

    return new GraphQLInputObjectType({
      name: `${enumType.name}Filter`,
      fields: () => ({
        eq: { type: enumType },
        neq: { type: enumType },
        in: { type: new GraphQLList(enumType) },
        containsAny: { type: new GraphQLList(enumType) },
        is: { type: FilterIs },
        isEmptyArray: { type: GraphQLBoolean },
      }),
    });
  }
}
