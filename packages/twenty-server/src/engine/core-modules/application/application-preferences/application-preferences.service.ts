import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ApplicationPreferencesDTO } from 'src/engine/core-modules/application/application-preferences/dtos/application-preferences.dto';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { fromFlatSettingsMenuItemToSettingsMenuItemDto } from 'src/engine/metadata-modules/flat-settings-menu-item/utils/from-flat-settings-menu-item-to-settings-menu-item-dto.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationPreferencesService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly userApplicationVariableValueService: UserApplicationVariableValueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findMyApplicationPreferences({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<ApplicationPreferencesDTO[]> {
    const [installedFlatApplications, { flatSettingsMenuItemMaps }] =
      await Promise.all([
        this.applicationService.findManyInstalledFlatApplications(workspaceId),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatSettingsMenuItemMaps',
        ]),
      ]);

    // The cached applications come in row order, which the database does not guarantee
    const sortedInstalledFlatApplications = [...installedFlatApplications].sort(
      (flatApplicationA, flatApplicationB) =>
        flatApplicationA.name.localeCompare(flatApplicationB.name) ||
        flatApplicationA.id.localeCompare(flatApplicationB.id),
    );

    const applicationPreferences = await Promise.all(
      sortedInstalledFlatApplications.map(
        async ({ id: applicationId }): Promise<ApplicationPreferencesDTO> => {
          const [myApplicationVariables] =
            await this.userApplicationVariableValueService.findUserApplicationVariableValues(
              {
                workspaceId,
                applicationId,
                requestUserWorkspaceId: userWorkspaceId,
              },
            );

          return {
            applicationId,
            settingsMenuItems: findFlatEntitiesByApplicationId({
              flatEntityMaps: flatSettingsMenuItemMaps,
              applicationId,
            })
              .filter(({ scope }) => scope === 'USER')
              .map(fromFlatSettingsMenuItemToSettingsMenuItemDto),
            variables: myApplicationVariables?.variables ?? [],
          };
        },
      ),
    );

    return applicationPreferences.filter(
      ({ settingsMenuItems, variables }) =>
        isNonEmptyArray(settingsMenuItems) || isNonEmptyArray(variables),
    );
  }
}
