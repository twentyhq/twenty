import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { findMarketplaceFlatApplications } from 'src/database/commands/upgrade-version-command/2-65/utils/find-marketplace-flat-applications.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';

const buildFlatApplication = (
  universalIdentifier: string,
  overrides: Partial<FlatApplication> = {},
) =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    sourceType: ApplicationRegistrationSourceType.NPM,
    deletedAt: null,
    ...overrides,
  }) as FlatApplication;

describe('findMarketplaceFlatApplications', () => {
  it('keeps npm, tarball and local apps, and exempts the custom app, twenty-standard, OAuth-only and deleted apps', () => {
    const flatApplications = [
      buildFlatApplication('npm-application'),
      buildFlatApplication('tarball-application', {
        sourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
      buildFlatApplication('local-application', {
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
      buildFlatApplication(WORKSPACE_CUSTOM_APPLICATION, {
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
      buildFlatApplication(TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER, {
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
      buildFlatApplication('oauth-only-application', {
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
      buildFlatApplication('deleted-application', {
        deletedAt: new Date('2026-11-26T00:00:00.000Z'),
      }),
    ];

    expect(
      findMarketplaceFlatApplications({
        flatApplicationMaps: {
          byId: Object.fromEntries(
            flatApplications.map((flatApplication) => [
              flatApplication.id,
              flatApplication,
            ]),
          ),
        },
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION,
      }).map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['npm-application', 'tarball-application', 'local-application']);
  });
});
