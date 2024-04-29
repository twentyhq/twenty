import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Injectable()
export class ArgsAliasFactory {
  private readonly logger = new Logger(ArgsAliasFactory.name);

  create(
    args: Record<string, any>,
    fieldMetadataCollection: FieldMetadataInterface[],
  ): Record<string, any> {
    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((fieldMetadata) => [
        fieldMetadata.name,
        fieldMetadata,
      ]),
    );

    return this.createArgsObjectRecursive(args, fieldMetadataMap);
  }

  private createArgsObjectRecursive(
    args: Record<string, any>,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    // If it's not an object, we don't need to do anything
    if (typeof args !== 'object' || args === null) {
      return args;
    }

    // If it's an array, we need to map all items
    if (Array.isArray(args)) {
      return args.map((arg) =>
        this.createArgsObjectRecursive(arg, fieldMetadataMap),
      );
    }

    const newArgs = {};

    for (const [key, value] of Object.entries(args)) {
      const fieldMetadata = fieldMetadataMap.get(key);

      if (fieldMetadata?.type === FieldMetadataType.RAW_JSON) {
        newArgs[key] = JSON.stringify(value);
        continue;
      }

      // If it's a composite type, we need to transform args to properly map column name
      if (
        fieldMetadata &&
        value !== null &&
        isCompositeFieldMetadataType(fieldMetadata.type)
      ) {
        // Get composite type definition
        const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

        if (!compositeType) {
          this.logger.error(
            `Composite type definition not found for type: ${fieldMetadata.type}`,
          );
          throw new Error(
            `Composite type definition not found for type: ${fieldMetadata.type}`,
          );
        }

        // Loop through sub values and map them to composite property
        for (const [subKey, subValue] of Object.entries(value)) {
          // Find composite property
          const compositeProperty = compositeType.properties.find(
            (property) => property.name === subKey,
          );

          if (compositeProperty) {
            const columnName = computeCompositeColumnName(
              fieldMetadata,
              compositeProperty,
            );

            if (compositeType.type === FieldMetadataType.RAW_JSON) {
              newArgs[columnName] = JSON.stringify(subValue);
            } else {
              newArgs[columnName] = subValue;
            }
          }
        }
      } else if (fieldMetadata) {
        newArgs[key] = value;
      } else {
        // Recurse if value is a nested object, otherwise append field or alias
        newArgs[key] = this.createArgsObjectRecursive(value, fieldMetadataMap);
      }
    }

    return newArgs;
  }
}
