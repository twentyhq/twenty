import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { generateFieldAlias } from 'src/engine/api/graphql/workspace-query-builder/utils/generate-field-alias.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getCompositeFieldMetadataCollection } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { createCompositeFieldKey } from 'src/engine/api/graphql/workspace-query-builder/utils/composite-field-metadata.util';

@Injectable()
export class FieldAliasFactory {
  private readonly logger = new Logger(FieldAliasFactory.name);

  create(fieldKey: string, fieldMetadata: FieldMetadataInterface) {
    // If it's not a composite field, we can just return the alias
    if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
      const alias = generateFieldAlias(fieldMetadata);

      return `${fieldKey}: ${alias}`;
    }

    // If it's a composite field, we need to compute the field metadata childs
    const compositeFieldMetadataCollection =
      getCompositeFieldMetadataCollection(fieldMetadata.type);

    return compositeFieldMetadataCollection
      .map((compositeFieldMetadata) => {
        // Generate a prefixed key for the composite field, this will be computed when the query has ran
        const compositeKey = createCompositeFieldKey(
          fieldMetadata.name,
          compositeFieldMetadata.name,
        );
        const alias = generateFieldAlias(compositeFieldMetadata);

        return `${compositeKey}: ${alias}`;
      })
      .join('\n');
  }
}
