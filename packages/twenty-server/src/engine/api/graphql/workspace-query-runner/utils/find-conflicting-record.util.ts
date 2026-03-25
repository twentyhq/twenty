import { compositeTypeDefinitions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const findConflictingRecord = async (
  columnName: string,
  conflictingValue: string,
  objectMetadata: FlatObjectMetadata,
  internalContext: WorkspaceInternalContext,
  entityManager: WorkspaceEntityManager,
): Promise<{ conflictingRecordId: string; fieldLabel: string } | null> => {
  const flatFields = getFlatFieldsFromFlatObjectMetadata(
    objectMetadata,
    internalContext.flatFieldMetadataMaps,
  );

  const uniqueFields = flatFields.filter((field) => field.isUnique);

  const matchingField = uniqueFields.find((field) => {
    const compositeType = compositeTypeDefinitions.get(field.type);

    if (!compositeType) {
      return field.name === columnName;
    }

    const property = compositeType.properties.find(
      (prop) => prop.isIncludedInUniqueConstraint,
    );

    if (!property) {
      return false;
    }

    const expectedColumnName = `${field.name}${capitalize(property.name)}`;

    return expectedColumnName === columnName;
  });

  if (!matchingField) {
    return null;
  }

  const queryBuilder = entityManager.createQueryBuilder(
    objectMetadata.nameSingular,
    objectMetadata.nameSingular,
    undefined,
    {
      shouldBypassPermissionChecks: true,
    },
  );

  queryBuilder.where(`"${columnName}" = :value`, { value: conflictingValue });
  queryBuilder.andWhere('"deletedAt" IS NULL');

  try {
    const conflictingRecord = await queryBuilder.getOne();

    if (!conflictingRecord) {
      return null;
    }

    return {
      conflictingRecordId: conflictingRecord.id,
      fieldLabel: matchingField.label,
    };
  } catch {
    // If query fails (e.g., permission denied, record not found), return null
    // This allows the duplicate error to still be shown without conflicting record link
    return null;
  }
};
