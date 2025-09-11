import { Injectable, Logger } from '@nestjs/common';

import { GraphQLEnumType } from 'graphql';
import { type FieldMetadataType } from 'twenty-shared/types';

import { StoredGqlType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import {
  type CompositeProperty,
  type CompositeType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { computeCompositeFieldEnumTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-enum-type-key.util';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

export interface StoredEnumGqlType extends StoredGqlType<GraphQLEnumType> {}

@Injectable()
export class CompositeFieldEnumTypeGenerator {
  private readonly logger = new Logger(CompositeFieldEnumTypeGenerator.name);

  public create(
    compositeType: CompositeType,
    options: WorkspaceBuildSchemaOptions,
  ): StoredEnumGqlType[] {
    const enumTypeDefinitions: StoredEnumGqlType[] = [];

    for (const compositeProperty of compositeType.properties) {
      if (!isEnumFieldMetadataType(compositeProperty.type)) {
        continue;
      }

      enumTypeDefinitions.push({
        key: computeCompositeFieldEnumTypeKey(
          compositeType.type,
          compositeProperty.name,
        ),
        type: this.generateEnum(compositeType.type, compositeProperty, options),
      });
    }

    return enumTypeDefinitions;
  }

  private generateEnum(
    compositeType: FieldMetadataType,
    compositeProperty: CompositeProperty,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLEnumType {
    // FixMe: It's a hack until Typescript get fixed on union types for reduce function
    // https://github.com/microsoft/TypeScript/issues/36390
    const enumOptions = compositeProperty.options as Array<
      FieldMetadataDefaultOption | FieldMetadataComplexOption
    >;

    if (!enumOptions) {
      this.logger.error(
        `Enum options are not defined for ${compositeProperty.name}`,
        {
          compositeProperty,
          options,
        },
      );

      throw new Error(
        `Enum options are not defined for ${compositeProperty.name}`,
      );
    }

    return new GraphQLEnumType({
      name: `${pascalCase(compositeType.toString())}${pascalCase(
        compositeProperty.name,
      )}Enum`,
      description: compositeProperty.description,
      values: enumOptions.reduce(
        (acc, enumOption) => {
          // Key must match this regex: /^[_A-Za-z][_0-9A-Za-z]+$/
          acc[enumOption.value] = {
            value: enumOption.value,
            description: enumOption.label,
          };

          return acc;
        },
        {} as { [key: string]: { value: string; description: string } },
      ),
    });
  }
}
