import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

@Injectable()
export class FieldAliasFactory {
  private readonly logger = new Logger(FieldAliasFactory.name);

  create(fieldKey: string, fieldMetadata: FieldMetadataInterface) {
    const entries = Object.entries(fieldMetadata.targetColumnMap);

    if (entries.length === 0) {
      return null;
    }

    if (entries.length === 1) {
      // If there is only one value, use it as the alias
      const alias = entries[0][1];

      return `${fieldKey}: ${alias}`;
    }

    // Otherwise it means it's a special type with multiple values, so we need map all columns
    return `
      ${entries
        .map(([key, value]) => `___${fieldMetadata.name}_${key}: ${value}`)
        .join('\n')}
    `;
  }
}
