import { Test, type TestingModule } from '@nestjs/testing';

import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WellKnownOAuthClientInstallService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-install.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CHATGPT_CALLBACK =
  'https://chatgpt.com/connector_platform_oauth_redirect';

type TestInstall = {
  universalIdentifier: string;
  applicationRegistration: {
    universalIdentifier: string;
    sourceType: ApplicationRegistrationSourceType;
    ownerWorkspaceId: string | null;
    oAuthClientId: string;
    oAuthRedirectUris: string[];
  };
};

const buildOAuthOnlyInstall = ({
  universalIdentifier,
  oAuthRedirectUris,
}: {
  universalIdentifier: string;
  oAuthRedirectUris: string[];
}): TestInstall => ({
  universalIdentifier,
  applicationRegistration: {
    universalIdentifier,
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    ownerWorkspaceId: null,
    oAuthClientId: v4(),
    oAuthRedirectUris,
  },
});

const SHARED_CLAUDE_INSTALL = buildOAuthOnlyInstall({
  universalIdentifier: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
  oAuthRedirectUris: [CLAUDE_CALLBACK],
});
const LEGACY_CLAUDE_INSTALL = buildOAuthOnlyInstall({
  universalIdentifier: 'legacy-claude-1',
  oAuthRedirectUris: [CLAUDE_CALLBACK],
});
const OTHER_LEGACY_CLAUDE_INSTALL = buildOAuthOnlyInstall({
  universalIdentifier: 'legacy-claude-2',
  oAuthRedirectUris: [CLAUDE_CALLBACK],
});
const SHARED_CHATGPT_INSTALL = buildOAuthOnlyInstall({
  universalIdentifier: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CHATGPT,
  oAuthRedirectUris: [CHATGPT_CALLBACK],
});
const LEGACY_CHATGPT_INSTALL = buildOAuthOnlyInstall({
  universalIdentifier: 'legacy-chatgpt',
  oAuthRedirectUris: [CHATGPT_CALLBACK],
});
const CUSTOM_OAUTH_INSTALL = buildOAuthOnlyInstall({
  universalIdentifier: 'custom-oauth-client',
  oAuthRedirectUris: ['https://example.com/callback'],
});
const NPM_INSTALL: TestInstall = {
  universalIdentifier: 'npm-app',
  applicationRegistration: {
    universalIdentifier: 'npm-app',
    sourceType: ApplicationRegistrationSourceType.NPM,
    ownerWorkspaceId: null,
    oAuthClientId: v4(),
    oAuthRedirectUris: [CLAUDE_CALLBACK],
  },
};

describe('WellKnownOAuthClientInstallService', () => {
  let service: WellKnownOAuthClientInstallService;
  let installs: TestInstall[];
  let isAppPreferencesEnabled: boolean;

  beforeEach(async () => {
    installs = [];
    isAppPreferencesEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WellKnownOAuthClientInstallService,
        {
          provide: getWorkspaceScopedRepositoryToken(ApplicationEntity),
          useValue: {
            findOne: async (
              _workspaceId: string,
              { where }: { where: { universalIdentifier: string } },
            ) =>
              installs.find(
                (install) =>
                  install.universalIdentifier === where.universalIdentifier,
              ) ?? null,
            find: async (
              _workspaceId: string,
              {
                where,
              }: {
                where: {
                  applicationRegistration: {
                    sourceType: ApplicationRegistrationSourceType;
                  };
                };
              },
            ) =>
              installs.filter(
                (install) =>
                  install.applicationRegistration.sourceType ===
                  where.applicationRegistration.sourceType,
              ),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            isFeatureEnabled: async (key: FeatureFlagKey) =>
              key === FeatureFlagKey.IS_APP_PREFERENCES_ENABLED &&
              isAppPreferencesEnabled,
          },
        },
      ],
    }).compile();

    service = module.get(WellKnownOAuthClientInstallService);
  });

  const findFoldedInstallUniversalIdentifiers = (universalIdentifier: string) =>
    service.findFoldedInstallUniversalIdentifiers({
      workspaceId: WORKSPACE_ID,
      universalIdentifier,
    });

  it('finds the older per-connection installs of the shared install client', async () => {
    installs = [
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
      OTHER_LEGACY_CLAUDE_INSTALL,
      CUSTOM_OAUTH_INSTALL,
    ];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        SHARED_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([
      LEGACY_CLAUDE_INSTALL.universalIdentifier,
      OTHER_LEGACY_CLAUDE_INSTALL.universalIdentifier,
    ]);
  });

  it('finds the other per-connection installs when the workspace has no shared install yet', async () => {
    installs = [LEGACY_CLAUDE_INSTALL, OTHER_LEGACY_CLAUDE_INSTALL];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        LEGACY_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([OTHER_LEGACY_CLAUDE_INSTALL.universalIdentifier]);
  });

  it('never folds the shared install into a per-connection install', async () => {
    installs = [
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
      OTHER_LEGACY_CLAUDE_INSTALL,
    ];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        LEGACY_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([OTHER_LEGACY_CLAUDE_INSTALL.universalIdentifier]);
  });

  it('finds nothing while app preferences are off, since Installed apps then lists every install', async () => {
    isAppPreferencesEnabled = false;
    installs = [
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
      OTHER_LEGACY_CLAUDE_INSTALL,
    ];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        SHARED_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([]);
    await expect(
      findFoldedInstallUniversalIdentifiers(
        LEGACY_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([]);
  });

  it.each([CUSTOM_OAUTH_INSTALL, NPM_INSTALL])(
    'finds nothing for an app that is not a well-known client ($universalIdentifier)',
    async (install) => {
      installs = [install, SHARED_CLAUDE_INSTALL, LEGACY_CLAUDE_INSTALL];

      await expect(
        findFoldedInstallUniversalIdentifiers(install.universalIdentifier),
      ).resolves.toEqual([]);
    },
  );

  it('leaves the installs of another well-known client alone', async () => {
    installs = [
      SHARED_CHATGPT_INSTALL,
      LEGACY_CHATGPT_INSTALL,
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
    ];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        SHARED_CHATGPT_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([LEGACY_CHATGPT_INSTALL.universalIdentifier]);
  });

  it('finds nothing when the app is not installed', async () => {
    installs = [LEGACY_CLAUDE_INSTALL];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        SHARED_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([]);
  });
});
