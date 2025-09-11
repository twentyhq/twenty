import { Injectable, Logger } from '@nestjs/common';

import { GraphQLEnumType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { StoredEnumGqlType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { transformEnumValue } from 'src/engine/utils/transform-enum-value';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class EnumFieldTypeGenerator {
  private readonly logger = new Logger(EnumFieldTypeGenerator.name);

  public generate(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): StoredEnumGqlType[] {
    const enumTypeDefinitions: StoredEnumGqlType[] = [];

    for (const fieldMetadata of objectMetadata.fields) {
      if (!isEnumFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      enumTypeDefinitions.push({
        key: computeEnumFieldGqlTypeKey(
          objectMetadata.nameSingular,
          fieldMetadata.name,
        ),
        type: this.generateEnum(
          objectMetadata.nameSingular,
          fieldMetadata,
          options,
        ),
      });
    }

    return enumTypeDefinitions;
  }

  private generateEnum(
    objectName: string,
    fieldMetadata: FieldMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLEnumType {
    // FixMe: It's a hack until Typescript get fixed on union types for reduce function
    // https://github.com/microsoft/TypeScript/issues/36390
    const enumOptions = transformEnumValue(
      fieldMetadata.options ?? undefined,
    ) as
      | Array<FieldMetadataDefaultOption | FieldMetadataComplexOption>
      | undefined;

    if (!isDefined(enumOptions)) {
      this.logger.error(
        `Enum options are not defined for ${fieldMetadata.name}`,
        {
          fieldMetadata,
          options,
        },
      );

      throw new Error(`Enum options are not defined for ${fieldMetadata.name}`);
    }

    return new GraphQLEnumType({
      name: `${pascalCase(objectName)}${pascalCase(fieldMetadata.name)}Enum`,
      description: fieldMetadata.description,
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
