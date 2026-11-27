import { Injectable } from '@nestjs/common';

import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-read-custom-permissions/utils/collect-records-by-object-name-singular.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadCustomPermissionRecordsInput } from 'src/engine/permissions/record-read-custom-permissions/types/record-read-custom-permission-handler-service.type';
import { RecordReadCustomPermissionsService } from 'src/engine/permissions/record-read-custom-permissions/record-read-custom-permissions.service';

// Runs on every record of a result, nested relations included, so restricted fields cannot leak through a relation
@Injectable()
export class CommonRecordReadCustomPermissionsService {
  constructor(
    private readonly recordReadCustomPermissionsService: RecordReadCustomPermissionsService,
  ) {}

  public async restrictRecords({
    records,
    flatObjectMetadata,
    selection,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    permissionsPrincipals,
    recordReadRestrictions,
  }: RecordReadCustomPermissionRecordsInput & {
    flatObjectMetadata: FlatObjectMetadata;
    selection: CommonSelection;
  }): Promise<void> {
    const objectNameSingulars =
      this.recordReadCustomPermissionsService.findObjectNameSingulars();

    if (objectNameSingulars.size === 0 || records.length === 0) {
      return;
    }

    const recordsByObjectNameSingular = collectRecordsByObjectNameSingular({
      records,
      flatObjectMetadata,
      selection,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingulars,
    });

    for (const [
      objectNameSingular,
      collectedRecords,
    ] of recordsByObjectNameSingular) {
      await this.recordReadCustomPermissionsService.restrictRecords({
        objectNameSingular,
        records: collectedRecords,
        authContext,
        permissionsPrincipals,
        recordReadRestrictions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
    }
  }
}
