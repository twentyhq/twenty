import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

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

      if (fieldMetadata) {
        newArgs[key] = value;
      } else {
        // Recurse if value is a nested object, otherwise append field or alias
        newArgs[key] = this.createArgsObjectRecursive(value, fieldMetadataMap);
      }
    }

    return newArgs;
  }
}
