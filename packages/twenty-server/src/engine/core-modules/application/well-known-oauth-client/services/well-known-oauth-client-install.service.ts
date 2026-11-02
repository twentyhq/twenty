import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindManyOptions } from 'typeorm';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { findWellKnownOAuthClientByUniversalIdentifier } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-universal-identifier.util';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';
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

@Injectable()
export class WellKnownOAuthClientInstallService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  // Mirrors Installed apps, which folds rows only with app preferences on, and folds per-connection installs into the seeded one, never the reverse
  async findFoldedInstallUniversalIdentifiers({
    workspaceId,
    universalIdentifier,
  }: {
    workspaceId: string;
    universalIdentifier: string;
  }): Promise<string[]> {
    const isAppPreferencesEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        workspaceId,
      );

    if (!isAppPreferencesEnabled) {
      return [];
    }

    const install = await this.applicationRepository.findOne(workspaceId, {
      ...INSTALL_WITH_REGISTRATION_FIND_OPTIONS,
      where: { universalIdentifier },
    });

    const wellKnownOAuthClient = getWellKnownOAuthClientOfRegistration(
      install?.applicationRegistration,
    );

    if (!isDefined(wellKnownOAuthClient)) {
      return [];
    }

    const oAuthOnlyInstalls = await this.applicationRepository.find(
      workspaceId,
      {
        ...INSTALL_WITH_REGISTRATION_FIND_OPTIONS,
        where: {
          applicationRegistration: {
            sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
          },
        },
      },
    );

    return oAuthOnlyInstalls
      .filter(
        (oAuthOnlyInstall) =>
          oAuthOnlyInstall.universalIdentifier !== universalIdentifier &&
          !isDefined(
            findWellKnownOAuthClientByUniversalIdentifier(
              oAuthOnlyInstall.universalIdentifier,
            ),
          ) &&
          getWellKnownOAuthClientOfRegistration(
            oAuthOnlyInstall.applicationRegistration,
          ) === wellKnownOAuthClient,
      )
      .map((oAuthOnlyInstall) => oAuthOnlyInstall.universalIdentifier);
  }
}
