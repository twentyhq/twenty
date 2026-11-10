import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindManyOptions } from 'typeorm';

import { ApplicationOAuthIdentityService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const INSTALL_WITH_REGISTRATION_FIND_OPTIONS = {
  relations: { applicationRegistration: true },
  select: {
    id: true,
    universalIdentifier: true,
    applicationRegistration: {
      id: true,
      universalIdentifier: true,
      sourceType: true,
      ownerWorkspaceId: true,
      oAuthClientId: true,
      oAuthRedirectUris: true,
    },
  },
} satisfies FindManyOptions<ApplicationEntity>;

// An app with an OAuth identity can also have installs made when each connection registered its own client; they act as one
@Injectable()
export class ApplicationOAuthIdentityInstallService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    private readonly applicationOAuthIdentityService: ApplicationOAuthIdentityService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async findFoldedApplicationIds({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<string[]> {
    const foldedInstalls = await this.findFoldedInstalls({
      workspaceId,
      where: { id: applicationId },
    });

    return isDefined(foldedInstalls)
      ? foldedInstalls.installs.map(({ id }) => id)
      : [applicationId];
  }

  async findFoldedInstallUniversalIdentifiers({
    workspaceId,
    universalIdentifier,
  }: {
    workspaceId: string;
    universalIdentifier: string;
  }): Promise<string[]> {
    const foldedInstalls = await this.findFoldedInstalls({
      workspaceId,
      where: { universalIdentifier },
    });

    if (!isDefined(foldedInstalls)) {
      return [];
    }

    const { oAuthIdentityUniversalIdentifier, installs } = foldedInstalls;

    // Uninstalling an older install alone leaves the app and its other installs in place
    if (
      universalIdentifier !== oAuthIdentityUniversalIdentifier &&
      installs.some(
        (install) =>
          install.universalIdentifier === oAuthIdentityUniversalIdentifier,
      )
    ) {
      return [];
    }

    return installs
      .filter((install) => install.universalIdentifier !== universalIdentifier)
      .map((install) => install.universalIdentifier);
  }

  private async findFoldedInstalls({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where: { id: string } | { universalIdentifier: string };
  }): Promise<{
    oAuthIdentityUniversalIdentifier: string;
    installs: ApplicationEntity[];
  } | null> {
    const isAppPreferencesEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        workspaceId,
      );

    if (!isAppPreferencesEnabled) {
      return null;
    }

    const install = await this.applicationRepository.findOne(workspaceId, {
      ...INSTALL_WITH_REGISTRATION_FIND_OPTIONS,
      where,
    });

    const oAuthIdentityUniversalIdentifier =
      await this.applicationOAuthIdentityService.findOAuthIdentityUniversalIdentifier(
        install?.applicationRegistration,
      );

    if (!isDefined(oAuthIdentityUniversalIdentifier)) {
      return null;
    }

    const candidateInstalls = await this.applicationRepository.find(
      workspaceId,
      {
        ...INSTALL_WITH_REGISTRATION_FIND_OPTIONS,
        where: [
          { universalIdentifier: oAuthIdentityUniversalIdentifier },
          {
            applicationRegistration: {
              sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
            },
          },
        ],
      },
    );

    const candidateOAuthIdentityUniversalIdentifiers = await Promise.all(
      candidateInstalls.map((candidateInstall) =>
        this.applicationOAuthIdentityService.findOAuthIdentityUniversalIdentifier(
          candidateInstall.applicationRegistration,
        ),
      ),
    );

    return {
      oAuthIdentityUniversalIdentifier,
      installs: candidateInstalls.filter(
        (_candidateInstall, index) =>
          candidateOAuthIdentityUniversalIdentifiers[index] ===
          oAuthIdentityUniversalIdentifier,
      ),
    };
  }
}
