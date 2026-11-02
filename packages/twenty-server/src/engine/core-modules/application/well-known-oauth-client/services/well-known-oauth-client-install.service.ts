import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type FindManyOptions } from 'typeorm';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';
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
      oAuthRedirectUris: true,
    },
  },
} satisfies FindManyOptions<ApplicationEntity>;

@Injectable()
export class WellKnownOAuthClientInstallService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async findOtherInstallUniversalIdentifiers({
    workspaceId,
    universalIdentifier,
  }: {
    workspaceId: string;
    universalIdentifier: string;
  }): Promise<string[]> {
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
          getWellKnownOAuthClientOfRegistration(
            oAuthOnlyInstall.applicationRegistration,
          ) === wellKnownOAuthClient,
      )
      .map((oAuthOnlyInstall) => oAuthOnlyInstall.universalIdentifier);
  }
}
