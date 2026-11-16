import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isComputedField, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Injectable()
export class LoadComputedFieldsHelper {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  // A write or an event carries stored columns only, so the computed fields a response selects are read afterwards
  public async loadMissingComputedFields({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    records,
    selectedFields,
    repository,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    records: ObjectRecord[];
    selectedFields: Record<string, unknown>;
    repository?: WorkspaceRepository;
  }): Promise<void> {
    const selectedComputedFieldNames = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    )
      .filter(
        (flatFieldMetadata) =>
          isComputedField(flatFieldMetadata) &&
          selectedFields[flatFieldMetadata.name] === true,
      )
      .map(({ name }) => name);

    const recordsMissingComputedFields = records.filter((record) =>
      selectedComputedFieldNames.some(
        (computedFieldName) => record[computedFieldName] === undefined,
      ),
    );

    if (!isNonEmptyArray(recordsMissingComputedFields)) {
      return;
    }

    const { nameSingular } = flatObjectMetadata;

    const computedRecords = await (
      repository ?? this.workspaceOrmManager.getRepository(nameSingular)
    )
      .createQueryBuilder(nameSingular)
      .setFindOptions({
        select: Object.fromEntries(
          ['id', ...selectedComputedFieldNames].map((columnName) => [
            columnName,
            true,
          ]),
        ),
      })
      .where(`"${nameSingular}"."id" IN (:...recordIds)`, {
        recordIds: recordsMissingComputedFields.map(({ id }) => id),
      })
      .withDeleted()
      .getMany<ObjectRecord>();

    const computedRecordById = new Map(
      computedRecords.map((computedRecord) => [
        computedRecord.id,
        computedRecord,
      ]),
    );

    for (const record of recordsMissingComputedFields) {
      Object.assign(record, computedRecordById.get(record.id));
    }
  }
}
