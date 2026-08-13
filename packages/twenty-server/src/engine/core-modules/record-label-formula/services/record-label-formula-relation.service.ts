import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMinimalSelectForRecordIdentifier } from 'src/engine/metadata-modules/navigation-menu-item/utils/get-minimal-select-for-record-identifier.util';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';

@Injectable()
export class RecordLabelFormulaRelationService {
  async loadRelationRecordLabels({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    records,
    relationFieldMetadatas,
    workspaceDataSource,
  }: {
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    records: ObjectRecord[];
    relationFieldMetadatas: FlatFieldMetadata[];
    workspaceDataSource: GlobalWorkspaceDataSource;
  }): Promise<Map<string, string>> {
    const relationRecordLabels = new Map<string, string>();
    const relationFieldsByTargetObjectId = new Map<
      string,
      FlatFieldMetadata[]
    >();

    relationFieldMetadatas.forEach((fieldMetadata) => {
      if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
        return;
      }

      const existingFields =
        relationFieldsByTargetObjectId.get(
          fieldMetadata.relationTargetObjectMetadataId,
        ) ?? [];

      relationFieldsByTargetObjectId.set(
        fieldMetadata.relationTargetObjectMetadataId,
        [...existingFields, fieldMetadata],
      );
    });

    for (const [
      targetObjectMetadataId,
      relationFields,
    ] of relationFieldsByTargetObjectId) {
      const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: targetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(targetObjectMetadata)) {
        continue;
      }

      const targetRecordIds = new Set<string>();

      for (const relationField of relationFields) {
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: relationField.name,
        });

        records.forEach((record) => {
          const targetRecordId = record[joinColumnName];

          if (typeof targetRecordId === 'string') {
            targetRecordIds.add(targetRecordId);
          }
        });
      }

      if (targetRecordIds.size === 0) {
        continue;
      }

      const targetRepository = workspaceDataSource.getRepository(
        targetObjectMetadata.nameSingular,
        { shouldBypassPermissionChecks: true },
      );
      const targetRecords = (await targetRepository.find({
        select: getMinimalSelectForRecordIdentifier({
          flatObjectMetadata: targetObjectMetadata,
          flatFieldMetadataMaps,
        }),
        where: { id: In([...targetRecordIds]) },
      })) as ObjectRecord[];

      targetRecords.forEach((targetRecord) => {
        relationRecordLabels.set(
          `${targetObjectMetadataId}:${targetRecord.id}`,
          getRecordDisplayName(
            targetRecord,
            targetObjectMetadata,
            flatFieldMetadataMaps,
          ),
        );
      });
    }

    return relationRecordLabels;
  }
}
