import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import { type ApplicationPreferencesDTO } from 'src/engine/core-modules/application/application-preferences/dtos/application-preferences.dto';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { fromFlatSettingsMenuItemToSettingsMenuItemDto } from 'src/engine/metadata-modules/flat-settings-menu-item/utils/from-flat-settings-menu-item-to-settings-menu-item-dto.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationPreferencesService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly userApplicationVariableValueService: UserApplicationVariableValueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
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

    const applicationIds = installedFlatApplications.map(({ id }) => id);

    const [
      myUserApplicationVariableValuesByApplicationId,
      connectionProviders,
      myPersonalConnectionProviderIds,
    ] = await Promise.all([
      this.userApplicationVariableValueService.findMyUserApplicationVariableValuesByApplicationId(
        {
          workspaceId,
          applicationIds,
          userWorkspaceId,
        },
      ),
      this.connectionProviderService.findManyDtosByApplications({
        applicationIds,
        workspaceId,
      }),
      this.findMyPersonalConnectionProviderIds({
        workspaceId,
        userWorkspaceId,
        applicationIds,
      }),
    ]);

    // A workspace provider is listed only to manage personal connections made before it became workspace-scoped
    const myConnectionProviders = connectionProviders.filter(
      ({ id, scope }) =>
        scope === 'USER' || myPersonalConnectionProviderIds.has(id),
    );

    return installedFlatApplications
      .map(({ id: applicationId }): ApplicationPreferencesDTO => ({
        applicationId,
        settingsMenuItems: findFlatEntitiesByApplicationId({
          flatEntityMaps: flatSettingsMenuItemMaps,
          applicationId,
        })
          .filter(({ scope }) => scope === 'USER')
          .map(fromFlatSettingsMenuItemToSettingsMenuItemDto),
        variables:
          myUserApplicationVariableValuesByApplicationId[applicationId],
        connectionProviders: myConnectionProviders.filter(
          (connectionProvider) =>
            connectionProvider.applicationId === applicationId,
        ),
      }))
      .filter(
        ({ settingsMenuItems, variables, connectionProviders }) =>
          isNonEmptyArray(settingsMenuItems) ||
          isNonEmptyArray(variables) ||
          isNonEmptyArray(connectionProviders),
      );
  }

  private async findMyPersonalConnectionProviderIds({
    workspaceId,
    userWorkspaceId,
    applicationIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    applicationIds: string[];
  }): Promise<Set<string>> {
    if (!isNonEmptyArray(applicationIds)) {
      return new Set();
    }

    const personalConnections = await this.connectedAccountRepository.find({
      select: { connectionProviderId: true },
      where: {
        workspaceId,
        userWorkspaceId,
        scope: 'USER',
        applicationId: In(applicationIds),
        connectionProviderId: Not(IsNull()),
      },
    });

    return new Set(
      personalConnections
        .map(({ connectionProviderId }) => connectionProviderId)
        .filter(isDefined),
    );
  }
}
