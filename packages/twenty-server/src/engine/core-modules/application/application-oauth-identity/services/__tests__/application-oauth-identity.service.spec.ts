import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { v4 } from 'uuid';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationOAuthIdentityService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity.service';
import { type ApplicationOAuthIdentityRegistration } from 'src/engine/core-modules/application/application-oauth-identity/types/application-oauth-identity-registration.type';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

const CHATGPT_CALLBACK =
  'https://chatgpt.com/connector_platform_oauth_redirect';
const CHATGPT_IDENTITY_REGISTRATION: ApplicationOAuthIdentityRegistration = {
  applicationRegistrationId: 'chatgpt-registration-id',
  universalIdentifier: '6e58bb83-49dc-4d4d-ae82-662890eda505',
  name: 'ChatGPT',
  oAuthIdentity: {
    redirectUris: [CHATGPT_CALLBACK, 'https://chatgpt.com/connector/oauth/*'],
    clientIdMetadataDocumentHostnames: ['chatgpt.com'],
    connectUrl: 'https://chatgpt.com/apps/twenty',
  },
};

const buildLegacyRegistration = (
  overrides: Partial<{
    sourceType: ApplicationRegistrationSourceType;
    ownerWorkspaceId: string | null;
    oAuthClientId: string;
    oAuthRedirectUris: string[];
  }> = {},
) => ({
  id: 'legacy-registration-id',
  universalIdentifier: 'legacy-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  ownerWorkspaceId: null,
  oAuthClientId: v4(),
  oAuthRedirectUris: ['https://chatgpt.com/connector/oauth/abc'],
  ...overrides,
});

describe('ApplicationOAuthIdentityService', () => {
  let service: ApplicationOAuthIdentityService;
  const chatGptRegistration = { id: 'chatgpt-registration-id' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationOAuthIdentityService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {
            findOne: async ({ where }: { where: { id: string } }) =>
              where.id === chatGptRegistration.id ? chatGptRegistration : null,
          },
        },
        {
          provide: CoreEntityCacheService,
          useValue: { get: async () => [CHATGPT_IDENTITY_REGISTRATION] },
        },
      ],
    }).compile();

    service = module.get(ApplicationOAuthIdentityService);
  });

  it('finds the app whose OAuth identity allows every callback', async () => {
    await expect(
      service.findRegistrationByRedirectUris([
        CHATGPT_CALLBACK,
        'https://chatgpt.com/connector/oauth/abc',
      ]),
    ).resolves.toBe(chatGptRegistration);
    await expect(
      service.findRegistrationByRedirectUris([
        CHATGPT_CALLBACK,
        'https://example.com/callback',
      ]),
    ).resolves.toBeNull();
    await expect(
      service.findRegistrationByRedirectUris([]),
    ).resolves.toBeNull();
  });

  it('only trusts a metadata document hosted where the identity says', async () => {
    await expect(
      service.findRegistrationByClientIdMetadataDocument({
        clientId: 'https://chatgpt.com/oauth/client.json',
        redirectUris: [CHATGPT_CALLBACK],
      }),
    ).resolves.toBe(chatGptRegistration);
    await expect(
      service.findRegistrationByClientIdMetadataDocument({
        clientId: 'https://example.com/oauth/client.json',
        redirectUris: [CHATGPT_CALLBACK],
      }),
    ).resolves.toBeNull();
  });

  it("resolves the app's own registration and its older per-connection ones to the app", async () => {
    await expect(
      service.findOAuthIdentityUniversalIdentifier({
        ...buildLegacyRegistration(),
        id: CHATGPT_IDENTITY_REGISTRATION.applicationRegistrationId,
        universalIdentifier: CHATGPT_IDENTITY_REGISTRATION.universalIdentifier,
        sourceType: ApplicationRegistrationSourceType.NPM,
        oAuthRedirectUris: [],
      }),
    ).resolves.toBe(CHATGPT_IDENTITY_REGISTRATION.universalIdentifier);
    await expect(
      service.findOAuthIdentityUniversalIdentifier(buildLegacyRegistration()),
    ).resolves.toBe(CHATGPT_IDENTITY_REGISTRATION.universalIdentifier);
  });

  it.each([
    ['an owned registration', { ownerWorkspaceId: 'workspace-id' }],
    [
      'a metadata document registration',
      { oAuthClientId: 'https://chatgpt.com/oauth/client.json' },
    ],
    ['an npm app', { sourceType: ApplicationRegistrationSourceType.NPM }],
    ['another client', { oAuthRedirectUris: ['https://example.com/callback'] }],
  ])('resolves nothing for %s', async (_description, overrides) => {
    await expect(
      service.findOAuthIdentityUniversalIdentifier(
        buildLegacyRegistration(overrides),
      ),
    ).resolves.toBeNull();
  });

  it('recognizes the name of a verified app whatever its case', async () => {
    await expect(service.isVerifiedClientName(' chatgpt ')).resolves.toBe(true);
    await expect(service.isVerifiedClientName('Cursor')).resolves.toBe(false);
  });
});
