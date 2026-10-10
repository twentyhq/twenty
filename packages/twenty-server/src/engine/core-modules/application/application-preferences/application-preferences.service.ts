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

    const sortedInstalledFlatApplications = [...installedFlatApplications].sort(
      (flatApplicationA, flatApplicationB) =>
        flatApplicationA.name.localeCompare(flatApplicationB.name) ||
        flatApplicationA.id.localeCompare(flatApplicationB.id),
    );

    const myUserApplicationVariableValuesByApplicationId =
      await this.userApplicationVariableValueService.findMyUserApplicationVariableValuesByApplicationId(
        {
          workspaceId,
          applicationIds: sortedInstalledFlatApplications.map(({ id }) => id),
          userWorkspaceId,
        },
      );

    return sortedInstalledFlatApplications
      .map(
        ({ id: applicationId }): ApplicationPreferencesDTO => ({
          applicationId,
          settingsMenuItems: findFlatEntitiesByApplicationId({
            flatEntityMaps: flatSettingsMenuItemMaps,
            applicationId,
          })
            .filter(({ scope }) => scope === 'USER')
            .map(fromFlatSettingsMenuItemToSettingsMenuItemDto),
          variables:
            myUserApplicationVariableValuesByApplicationId[applicationId],
        }),
      )
      .filter(
        ({ settingsMenuItems, variables }) =>
          isNonEmptyArray(settingsMenuItems) || isNonEmptyArray(variables),
      );
  }
}
