import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationOAuthIdentityInstallService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity-install.service';
import { ApplicationOAuthIdentityService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity.service';
import { type ApplicationOAuthIdentityRegistration } from 'src/engine/core-modules/application/application-oauth-identity/types/application-oauth-identity-registration.type';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CHATGPT_CALLBACK =
  'https://chatgpt.com/connector_platform_oauth_redirect';
const CLAUDE_UNIVERSAL_IDENTIFIER = '3e0bda4b-fb1d-42bd-bab3-03b66698e6ff';
const CHATGPT_UNIVERSAL_IDENTIFIER = '6e58bb83-49dc-4d4d-ae82-662890eda505';

type TestInstall = {
  id: string;
  universalIdentifier: string;
  applicationRegistration: {
    id: string;
    universalIdentifier: string;
    sourceType: ApplicationRegistrationSourceType;
    ownerWorkspaceId: string | null;
    oAuthClientId: string;
    oAuthRedirectUris: string[];
  };
};

const buildInstall = ({
  universalIdentifier,
  sourceType = ApplicationRegistrationSourceType.OAUTH_ONLY,
  oAuthRedirectUris,
}: {
  universalIdentifier: string;
  sourceType?: ApplicationRegistrationSourceType;
  oAuthRedirectUris: string[];
}): TestInstall => ({
  id: `${universalIdentifier}-id`,
  universalIdentifier,
  applicationRegistration: {
    id: `${universalIdentifier}-registration-id`,
    universalIdentifier,
    sourceType,
    ownerWorkspaceId: null,
    oAuthClientId: v4(),
    oAuthRedirectUris,
  },
});

const SHARED_CLAUDE_INSTALL = buildInstall({
  universalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
  sourceType: ApplicationRegistrationSourceType.NPM,
  oAuthRedirectUris: [],
});
const LEGACY_CLAUDE_INSTALL = buildInstall({
  universalIdentifier: 'legacy-claude-1',
  oAuthRedirectUris: [CLAUDE_CALLBACK],
});
const OTHER_LEGACY_CLAUDE_INSTALL = buildInstall({
  universalIdentifier: 'legacy-claude-2',
  oAuthRedirectUris: [CLAUDE_CALLBACK],
});
const SHARED_CHATGPT_INSTALL = buildInstall({
  universalIdentifier: CHATGPT_UNIVERSAL_IDENTIFIER,
  sourceType: ApplicationRegistrationSourceType.NPM,
  oAuthRedirectUris: [],
});
const LEGACY_CHATGPT_INSTALL = buildInstall({
  universalIdentifier: 'legacy-chatgpt',
  oAuthRedirectUris: [CHATGPT_CALLBACK],
});
const CUSTOM_OAUTH_INSTALL = buildInstall({
  universalIdentifier: 'custom-oauth-client',
  oAuthRedirectUris: ['https://example.com/callback'],
});
const NPM_INSTALL = buildInstall({
  universalIdentifier: 'npm-app',
  sourceType: ApplicationRegistrationSourceType.NPM,
  oAuthRedirectUris: [CLAUDE_CALLBACK],
});

const OAUTH_IDENTITY_REGISTRATIONS: ApplicationOAuthIdentityRegistration[] = [
  {
    applicationRegistrationId: SHARED_CLAUDE_INSTALL.applicationRegistration.id,
    universalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
    name: 'Claude',
    oAuthIdentity: {
      redirectUris: [CLAUDE_CALLBACK],
      connectUrl: 'https://claude.ai',
    },
  },
  {
    applicationRegistrationId:
      SHARED_CHATGPT_INSTALL.applicationRegistration.id,
    universalIdentifier: CHATGPT_UNIVERSAL_IDENTIFIER,
    name: 'ChatGPT',
    oAuthIdentity: {
      redirectUris: [CHATGPT_CALLBACK],
      connectUrl: 'https://chatgpt.com',
    },
  },
];

type InstallWhere = {
  id?: string;
  universalIdentifier?: string;
  applicationRegistration?: { sourceType: ApplicationRegistrationSourceType };
};

const matchesWhere = (install: TestInstall, where: InstallWhere) =>
  (where.id === undefined || install.id === where.id) &&
  (where.universalIdentifier === undefined ||
    install.universalIdentifier === where.universalIdentifier) &&
  (where.applicationRegistration === undefined ||
    install.applicationRegistration.sourceType ===
      where.applicationRegistration.sourceType);

describe('ApplicationOAuthIdentityInstallService', () => {
  let service: ApplicationOAuthIdentityInstallService;
  let installs: TestInstall[];
  let isAppPreferencesEnabled: boolean;

  beforeEach(async () => {
    installs = [];
    isAppPreferencesEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationOAuthIdentityInstallService,
        ApplicationOAuthIdentityService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {},
        },
        {
          provide: CoreEntityCacheService,
          useValue: { get: async () => OAUTH_IDENTITY_REGISTRATIONS },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(ApplicationEntity),
          useValue: {
            findOne: async (
              _workspaceId: string,
              { where }: { where: InstallWhere },
            ) =>
              installs.find((install) => matchesWhere(install, where)) ?? null,
            find: async (
              _workspaceId: string,
              { where }: { where: InstallWhere[] },
            ) =>
              installs.filter((install) =>
                where.some((condition) => matchesWhere(install, condition)),
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

    service = module.get(ApplicationOAuthIdentityInstallService);
  });

  const findFoldedApplicationIds = (applicationId: string) =>
    service.findFoldedApplicationIds({
      workspaceId: WORKSPACE_ID,
      applicationId,
    });

  it("folds the app's install and every older per-connection install into one application", async () => {
    installs = [
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
      OTHER_LEGACY_CLAUDE_INSTALL,
      SHARED_CHATGPT_INSTALL,
      CUSTOM_OAUTH_INSTALL,
    ];

    for (const install of [SHARED_CLAUDE_INSTALL, LEGACY_CLAUDE_INSTALL]) {
      await expect(findFoldedApplicationIds(install.id)).resolves.toEqual([
        SHARED_CLAUDE_INSTALL.id,
        LEGACY_CLAUDE_INSTALL.id,
        OTHER_LEGACY_CLAUDE_INSTALL.id,
      ]);
    }
  });

  it('keeps any other application, and every install while app preferences are off, on its own', async () => {
    installs = [
      CUSTOM_OAUTH_INSTALL,
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
    ];

    await expect(
      findFoldedApplicationIds(CUSTOM_OAUTH_INSTALL.id),
    ).resolves.toEqual([CUSTOM_OAUTH_INSTALL.id]);

    isAppPreferencesEnabled = false;

    await expect(
      findFoldedApplicationIds(SHARED_CLAUDE_INSTALL.id),
    ).resolves.toEqual([SHARED_CLAUDE_INSTALL.id]);
  });

  const findFoldedInstallUniversalIdentifiers = (universalIdentifier: string) =>
    service.findFoldedInstallUniversalIdentifiers({
      workspaceId: WORKSPACE_ID,
      universalIdentifier,
    });

  it("finds the older per-connection installs of the app's install", async () => {
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

  it('finds the other per-connection installs when the workspace has no install of the app yet', async () => {
    installs = [LEGACY_CLAUDE_INSTALL, OTHER_LEGACY_CLAUDE_INSTALL];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        LEGACY_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([OTHER_LEGACY_CLAUDE_INSTALL.universalIdentifier]);
  });

  it("finds nothing for a per-connection install while the app's install exists", async () => {
    installs = [
      SHARED_CLAUDE_INSTALL,
      LEGACY_CLAUDE_INSTALL,
      OTHER_LEGACY_CLAUDE_INSTALL,
    ];

    await expect(
      findFoldedInstallUniversalIdentifiers(
        LEGACY_CLAUDE_INSTALL.universalIdentifier,
      ),
    ).resolves.toEqual([]);
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
    'finds nothing for an app without an OAuth identity ($universalIdentifier)',
    async (install) => {
      installs = [install, SHARED_CLAUDE_INSTALL, LEGACY_CLAUDE_INSTALL];

      await expect(
        findFoldedInstallUniversalIdentifiers(install.universalIdentifier),
      ).resolves.toEqual([]);
    },
  );

  it('leaves the installs of another app with an OAuth identity alone', async () => {
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
