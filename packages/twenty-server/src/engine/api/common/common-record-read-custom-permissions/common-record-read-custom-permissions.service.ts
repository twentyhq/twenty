import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-read-custom-permissions/utils/collect-records-by-object-name-singular.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RecordReadCustomPermissionsService } from 'src/engine/permissions/record-read-custom-permissions/record-read-custom-permissions.service';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

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
  }: {
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    selection: CommonSelection;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    authContext: WorkspaceAuthContext;
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
    recordReadRestrictions: RecordReadRestrictions;
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
