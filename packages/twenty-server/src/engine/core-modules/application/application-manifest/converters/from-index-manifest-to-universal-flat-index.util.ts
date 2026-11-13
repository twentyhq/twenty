import { isNonEmptyString } from '@sniptt/guards';
import { type IndexManifest } from 'twenty-shared/application';
import {
  type FieldMetadataType,
  IndexType,
  type OrderByDirection,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { normalizeIndexFieldDirection } from 'src/engine/metadata-modules/index-metadata/utils/normalize-index-field-direction.util';
import { validateIndexTypeAgainstFieldsOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/validate-index-type-against-fields.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const fromIndexManifestToUniversalFlatIndex = ({
  indexManifest,
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  applicationUniversalIdentifier,
  now,
}: {
  indexManifest: IndexManifest;
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatIndexMetadata => {
  if (indexManifest.fields.length === 0) {
    throw new Error(
      `Index "${indexManifest.universalIdentifier}" must reference at least one field`,
    );
  }

  const dedupKeys = indexManifest.fields.map(
    (entry) => `${entry.fieldUniversalIdentifier}::${entry.subFieldName ?? ''}`,
  );

  if (new Set(dedupKeys).size !== dedupKeys.length) {
    throw new Error(
      `Index "${indexManifest.universalIdentifier}" lists the same column twice`,
    );
  }

  const resolvedIndexType = indexManifest.indexType ?? IndexType.BTREE;
  const resolvedFieldsForValidation: Array<{
    type: FieldMetadataType;
    name: string;
    label: string;
    subFieldName: string | null;
    direction: OrderByDirection | null;
  }> = [];

  const universalFlatIndexFieldMetadatas = indexManifest.fields.map(
    (entry, order) => {
      const flatField = objectFlatFieldMetadatas.find(
        (candidate) =>
          candidate.universalIdentifier === entry.fieldUniversalIdentifier,
      );

      if (!isDefined(flatField)) {
        throw new Error(
          `Index "${indexManifest.universalIdentifier}" references unknown field ${entry.fieldUniversalIdentifier} on object ${flatObjectMetadata.universalIdentifier}`,
        );
      }

      const isComposite = isCompositeFieldMetadataType(flatField.type);

      if (isComposite) {
        if (!isNonEmptyString(entry.subFieldName)) {
          throw new Error(
            `Composite field "${flatField.name}" requires a subFieldName in index "${indexManifest.universalIdentifier}"`,
          );
        }

        const property = compositeTypeDefinitions
          .get(flatField.type)
          ?.properties.find(
            (compositeProperty) =>
              compositeProperty.name === entry.subFieldName,
          );

        if (!isDefined(property)) {
          throw new Error(
            `Sub-field "${entry.subFieldName}" not found on composite field "${flatField.name}" in index "${indexManifest.universalIdentifier}"`,
          );
        }
      } else if (isNonEmptyString(entry.subFieldName)) {
        throw new Error(
          `Field "${flatField.name}" is not composite — subFieldName must be omitted in index "${indexManifest.universalIdentifier}"`,
        );
      }

      if (isDefined(entry.direction) && !isOrderByDirection(entry.direction)) {
        throw new Error(
          `Field "${flatField.name}" has an invalid direction "${entry.direction}" in index "${indexManifest.universalIdentifier}"`,
        );
      }

      const subFieldName = isComposite ? (entry.subFieldName ?? null) : null;

      resolvedFieldsForValidation.push({
        type: flatField.type,
        name: flatField.name,
        label: flatField.label,
        subFieldName,
        direction: entry.direction ?? null,
      });

      return {
        createdAt: now,
        updatedAt: now,
        order,
        subFieldName,
        direction: normalizeIndexFieldDirection(entry.direction),
        fieldMetadataUniversalIdentifier: flatField.universalIdentifier,
        indexMetadataUniversalIdentifier: indexManifest.universalIdentifier,
      };
    },
  );

  validateIndexTypeAgainstFieldsOrThrow({
    indexType: resolvedIndexType,
    fields: resolvedFieldsForValidation,
  });

  return generateFlatIndexMetadataWithNameOrThrow({
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    flatIndex: {
      createdAt: now,
      updatedAt: now,
      universalIdentifier: indexManifest.universalIdentifier,
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      indexType: resolvedIndexType,
      indexWhereClause: null,
      isUnique: indexManifest.isUnique ?? false,
      isSystemSideEffect: false,
      universalFlatIndexFieldMetadatas,
    },
  });
};
