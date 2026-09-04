import { Injectable } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatApplicationToApplicationManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-application-to-application-manifest.util';
import { type ApplicationExport } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { assertFlatApplicationIsExportable } from 'src/engine/core-modules/application/application-manifest/utils/assert-flat-application-is-exportable.util';
import { classifyApplicationFlatEntities } from 'src/engine/core-modules/application/application-manifest/utils/classify-application-flat-entities.util';
import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import { reconstructDataModelManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-data-model-manifest.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const PLACEHOLDER_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  STANDARD_ROLE.admin.universalIdentifier;

const findUniversalIdentifierById = ({
  flatEntityMaps,
  id,
}: {
  flatEntityMaps: { universalIdentifierById: Partial<Record<string, string>> };
  id: string | null;
}): string | undefined =>
  isDefined(id) ? flatEntityMaps.universalIdentifierById[id] : undefined;

@Injectable()
export class ApplicationManifestExportService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async exportApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<ApplicationExport> {
    const { flatApplicationMaps, ...allFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
        'flatApplicationMaps',
      ]);

    const flatApplication = findActiveFlatApplicationByUniversalIdentifier(
      flatApplicationMaps,
      applicationUniversalIdentifier,
    );

    if (!isDefined(flatApplication)) {
      throw new ApplicationException(
        `Application "${applicationUniversalIdentifier}" is not installed in workspace "${workspaceId}"`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    assertFlatApplicationIsExportable(flatApplication);

    const applicationAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
      applicationIds: [flatApplication.id],
      fromAllFlatEntityMaps: allFlatEntityMaps,
    });

    const { objects, fields, indexes, coverage } = reconstructDataModelManifest(
      { applicationAllFlatEntityMaps },
    );

    const manifest: Manifest = {
      application: fromFlatApplicationToApplicationManifest({
        flatApplication,
        defaultRoleUniversalIdentifier:
          findUniversalIdentifierById({
            flatEntityMaps: allFlatEntityMaps.flatRoleMaps,
            id: flatApplication.defaultRoleId,
          }) ?? PLACEHOLDER_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
        settingsFrontComponentUniversalIdentifier: findUniversalIdentifierById({
          flatEntityMaps: allFlatEntityMaps.flatFrontComponentMaps,
          id: flatApplication.settingsCustomTabFrontComponentId,
        }),
        uninstallLogicFunctionUniversalIdentifier: findUniversalIdentifierById({
          flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
          id: flatApplication.uninstallLogicFunctionId,
        }),
      }),
      objects,
      fields,
      indexes,
      logicFunctions: [],
      frontComponents: [],
      permissionFlags: [],
      roles: [],
      skills: [],
      agents: [],
      publicAssets: [],
      views: [],
      viewFields: [],
      navigationMenuItems: [],
      pageLayouts: [],
      pageLayoutTabs: [],
      commandMenuItems: [],
      timelineActivityTypes: [],
    };

    return {
      application: {
        universalIdentifier: flatApplication.universalIdentifier,
        displayName: flatApplication.name,
        sourceType: flatApplication.sourceType,
      },
      manifest,
      coverage: classifyApplicationFlatEntities({
        flatApplication,
        applicationAllFlatEntityMaps,
        allFlatEntityMaps,
        reconstructedCoverage: coverage,
      }),
      files: [],
    };
  }
}
