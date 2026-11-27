import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RecordVisibilityRestrictionsService } from 'src/engine/permissions/record-visibility-restrictions.service';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

// Runs on every record of a result, nested relations included, so restricted fields cannot leak through a relation
@Injectable()
export class CommonRecordVisibilityService {
  constructor(
    private readonly recordVisibilityRestrictionsService: RecordVisibilityRestrictionsService,
  ) {}

  public async applyVisibilityRestrictions({
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
    const restrictedObjectNameSingulars =
      this.recordVisibilityRestrictionsService.findRestrictedObjectNameSingulars();

    if (restrictedObjectNameSingulars.size === 0 || records.length === 0) {
      return;
    }

    const recordsByObjectNameSingular = collectRecordsByObjectNameSingular({
      records,
      flatObjectMetadata,
      selection,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingulars: restrictedObjectNameSingulars,
    });

    for (const [
      objectNameSingular,
      collectedRecords,
    ] of recordsByObjectNameSingular) {
      await this.recordVisibilityRestrictionsService.applyVisibilityRestrictions(
        {
          objectNameSingular,
          records: collectedRecords,
          authContext,
          permissionsPrincipals,
          recordReadRestrictions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        },
      );
    }
  }
}
