import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

@Injectable()
export class ArgsAliasFactory {
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

      // If it's a special complex field, we need to map all columns
      if (
        fieldMetadata &&
        typeof value === 'object' &&
        value !== null &&
        Object.values(fieldMetadata.targetColumnMap).length > 1
      ) {
        for (const [subKey, subValue] of Object.entries(value)) {
          const mappedKey = fieldMetadata.targetColumnMap[subKey];

          if (mappedKey) {
            newArgs[mappedKey] = subValue;
          }
        }
      } else if (fieldMetadata) {
        // Otherwise we just need to map the value
        const mappedKey = fieldMetadata.targetColumnMap.value;

        newArgs[mappedKey ?? key] = value;
      } else {
        // Recurse if value is a nested object, otherwise append field or alias
        newArgs[key] = this.createArgsObjectRecursive(value, fieldMetadataMap);
      }
    }

    return newArgs;
  }
}
