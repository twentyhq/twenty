import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { createCompositeFieldKey } from 'src/engine/api/graphql/workspace-query-builder/utils/composite-field-metadata.util';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

@Injectable()
export class FieldAliasFactory {
  private readonly logger = new Logger(FieldAliasFactory.name);

  create(fieldKey: string, fieldMetadata: FieldMetadataInterface) {
    // If it's not a composite field, we can just return the alias
    if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
      const alias = computeColumnName(fieldMetadata);

      return `${fieldKey}: ${alias}`;
    }

    // If it's a composite field, we need to get the definition
    const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

    if (!compositeType) {
      this.logger.error(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      );
      throw new Error(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      );
    }

    return compositeType.properties
      .map((property) => {
        // Generate a prefixed key for the composite field, this will be computed when the query has ran
        const compositeKey = createCompositeFieldKey(
          fieldMetadata.name,
          property.name,
        );
        const alias = computeCompositeColumnName(fieldMetadata, property);

        return `${compositeKey}: ${alias}`;
      })
      .join('\n');
  }
}
