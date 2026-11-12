import { Test } from '@nestjs/testing';

import { McpClientModeService } from 'src/engine/api/mcp/services/mcp-client-mode.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

describe('McpClientModeService', () => {
  const application = {
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    universalIdentifier: '20202020-0000-4000-8000-000000000001',
  };
  const registrationLookup = {
    findOneByUniversalIdentifierGlobal: jest.fn(),
  };
  let service: McpClientModeService;

  beforeEach(async () => {
    registrationLookup.findOneByUniversalIdentifierGlobal.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        McpClientModeService,
        {
          provide: ApplicationRegistrationLookupService,
          useValue: registrationLookup,
        },
      ],
    }).compile();

    service = module.get(McpClientModeService);
  });

  it.each([
    'https://chatgpt.com/connector_platform_oauth_redirect',
    'https://chatgpt.com/connector/oauth/twenty-callback',
  ])('should default ChatGPT to meta mode for %s', async (redirectUri) => {
    registrationLookup.findOneByUniversalIdentifierGlobal.mockResolvedValue({
      oAuthRedirectUris: [redirectUri],
    });

    await expect(service.isDirectMode({ application })).resolves.toBe(false);
  });

  it.each([
    'https://claude.ai/api/mcp/auth_callback',
    'https://chatgpt.com.example.com/connector_platform_oauth_redirect',
    'https://chatgpt.com@other.example/connector_platform_oauth_redirect',
    'http://chatgpt.com/connector_platform_oauth_redirect',
    'https://chatgpt.com/other_callback',
    'https://chatgpt.com/connector/oauth/',
    'not a URL',
  ])('should keep direct mode for other callbacks: %s', async (redirectUri) => {
    registrationLookup.findOneByUniversalIdentifierGlobal.mockResolvedValue({
      oAuthRedirectUris: [redirectUri],
    });

    await expect(service.isDirectMode({ application })).resolves.toBe(true);
  });

  it.each<[string, boolean]>([
    ['direct', true],
    ['meta', false],
  ])(
    'should honor explicit mode %s without looking up the client',
    async (mode, expected) => {
      registrationLookup.findOneByUniversalIdentifierGlobal.mockRejectedValue(
        new Error('Registration lookup unavailable'),
      );

      await expect(service.isDirectMode({ mode, application })).resolves.toBe(
        expected,
      );
    },
  );

  it('should keep direct mode for API keys and user sessions', async () => {
    registrationLookup.findOneByUniversalIdentifierGlobal.mockRejectedValue(
      new Error('Registration lookup unavailable'),
    );

    await expect(service.isDirectMode({})).resolves.toBe(true);
  });

  it('should keep direct mode for applications that are not OAuth-only', async () => {
    registrationLookup.findOneByUniversalIdentifierGlobal.mockRejectedValue(
      new Error('Registration lookup unavailable'),
    );

    await expect(
      service.isDirectMode({
        application: {
          ...application,
          sourceType: ApplicationRegistrationSourceType.NPM,
        },
      }),
    ).resolves.toBe(true);
  });

  it('should keep direct mode when the registration no longer exists', async () => {
    registrationLookup.findOneByUniversalIdentifierGlobal.mockResolvedValue(
      null,
    );

    await expect(service.isDirectMode({ application })).resolves.toBe(true);
  });
});
