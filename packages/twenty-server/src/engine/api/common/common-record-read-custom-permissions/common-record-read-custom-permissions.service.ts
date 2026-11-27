import { Injectable } from '@nestjs/common';

import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-read-custom-permissions/utils/collect-records-by-object-name-singular.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadCustomPermissionRecordsInput } from 'src/engine/permissions/record-read-custom-permissions/types/record-read-custom-permission-handler-service.type';
import { RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS } from 'src/engine/permissions/record-read-custom-permissions/constants/record-read-custom-permission-object-name-singulars.constant';
import { RecordReadCustomPermissionsService } from 'src/engine/permissions/record-read-custom-permissions/record-read-custom-permissions.service';

@Injectable()
export class CommonRecordReadCustomPermissionsService {
  constructor(
    private readonly recordReadCustomPermissionsService: RecordReadCustomPermissionsService,
  ) {}

  public async applyToRecords({
    records,
    flatObjectMetadata,
    selection,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    recordReadRestrictions,
  }: RecordReadCustomPermissionRecordsInput & {
    flatObjectMetadata: FlatObjectMetadata;
    selection: CommonSelection;
  }): Promise<void> {
    if (records.length === 0) {
      return;
    }

    const recordsByObjectNameSingular = collectRecordsByObjectNameSingular({
      records,
      flatObjectMetadata,
      selection,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingulars: RECORD_READ_CUSTOM_PERMISSION_OBJECT_NAME_SINGULARS,
    });

    for (const [
      objectNameSingular,
      collectedRecords,
    ] of recordsByObjectNameSingular) {
      await this.recordReadCustomPermissionsService.applyToRecords({
        objectNameSingular,
        records: collectedRecords,
        authContext,
        recordReadRestrictions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
    }
  }
}
