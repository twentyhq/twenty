import { Injectable, Logger } from '@nestjs/common';

import { GraphQLEnumType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import {
  CompositeProperty,
  CompositeType,
} from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { EnumTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/enum-type-definition.factory';
import { computeCompositePropertyTarget } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-composite-property-target.util';
import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

export interface EnumTypeDefinition {
  target: string;
  type: GraphQLEnumType;
}

@Injectable()
export class CompositeEnumTypeDefinitionFactory {
  private readonly logger = new Logger(EnumTypeDefinitionFactory.name);

  public create(
    compositeType: CompositeType,
    options: WorkspaceBuildSchemaOptions,
  ): EnumTypeDefinition[] {
    const enumTypeDefinitions: EnumTypeDefinition[] = [];

    for (const compositeProperty of compositeType.properties) {
      if (!isEnumFieldMetadataType(compositeProperty.type)) {
        continue;
      }

      const target = computeCompositePropertyTarget(
        compositeType.type,
        compositeProperty,
      );

      enumTypeDefinitions.push({
        target,
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
