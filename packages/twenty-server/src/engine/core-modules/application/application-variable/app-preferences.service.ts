import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type AppPreferencesApplicationDTO } from 'src/engine/core-modules/application/application-variable/dtos/app-preferences-application.dto';
import { type UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AppPreferencesService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    @InjectWorkspaceScopedRepository(ConnectionProviderEntity)
    private readonly connectionProviderRepository: WorkspaceScopedRepository<ConnectionProviderEntity>,
    private readonly userApplicationVariableValueService: UserApplicationVariableValueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findApplicationsWithPreferences({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<AppPreferencesApplicationDTO[]> {
    const connectionProviders = await this.connectionProviderRepository.find(
      workspaceId,
      { select: { applicationId: true } },
    );
    const applicationIdsWithConnectionProviders = new Set(
      connectionProviders.map(({ applicationId }) => applicationId),
    );
    const installedApplicationStates = In([
      ApplicationState.INSTALLED,
      ApplicationState.UPGRADING,
    ]);
    const applications = await this.applicationRepository.find(workspaceId, {
      where: [
        {
          state: installedApplicationStates,
          applicationVariables: { scope: 'USER' },
        },
        {
          state: installedApplicationStates,
          id: In([...applicationIdsWithConnectionProviders]),
        },
      ],
      relations: { applicationVariables: true },
      select: {
        id: true,
        universalIdentifier: true,
        name: true,
        logo: true,
        applicationVariables: { id: true, scope: true },
      },
      order: { name: 'ASC', id: 'ASC' },
    });

    return applications.map(({ id, universalIdentifier, name, logo }) => ({
      id,
      universalIdentifier,
      name,
      hasConnectionProviders: applicationIdsWithConnectionProviders.has(id),
      logoUrl: buildPublicAssetLogoUrl({
        applicationId: id,
        workspaceId,
        logo,
        serverUrl: this.twentyConfigService.get('SERVER_URL'),
      }),
    }));
  }

  async findMyApplicationVariablesOrThrow({
    workspaceId,
    userWorkspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<UserApplicationVariableValueDTO[]> {
    const application = await this.applicationRepository.findOne(workspaceId, {
      where: {
        universalIdentifier: applicationUniversalIdentifier,
        state: In([ApplicationState.INSTALLED, ApplicationState.UPGRADING]),
      },
      select: { id: true },
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} is not installed in this workspace`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
      );
    }

    const memberVariables =
      await this.userApplicationVariableValueService.findUserApplicationVariableValues(
        {
          workspaceId,
          applicationId: application.id,
          requestUserWorkspaceId: userWorkspaceId,
        },
      );

    return memberVariables[0]?.variables ?? [];
  }
}
