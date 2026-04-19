import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SsoService } from 'src/engine/core-modules/Sso/services/Sso.service';
import { SsoException } from 'src/engine/core-modules/Sso/Sso.exception';
import { WorkspaceSsoIdentityProviderEntity } from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('SsoService', () => {
  let service: SsoService;
  let repository: Repository<WorkspaceSsoIdentityProviderEntity>;
  let billingService: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SsoService,
        {
          provide: getRepositoryToken(WorkspaceSsoIdentityProviderEntity),
          useClass: Repository,
        },
        {
          provide: BillingService,
          useValue: {
            hasEntitlement: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: {
            captureExceptions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SsoService>(SsoService);
    repository = module.get<Repository<WorkspaceSsoIdentityProviderEntity>>(
      getRepositoryToken(WorkspaceSsoIdentityProviderEntity),
    );
    billingService = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOidcIdentityProvider', () => {
    it('should create an Oidc identity provider successfully', async () => {
      const workspaceId = 'workspace-123';
      const data = {
        issuer: 'https://example.com',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        name: 'Test Provider',
      };
      const mockIssuer = { metadata: { issuer: 'https://example.com' } };
      const mockSavedProvider = {
        id: 'provider-123',
        type: 'Oidc',
        name: 'Test Provider',
        status: 'ACTIVE',
        issuer: 'https://example.com',
      };

      jest.spyOn(billingService, 'hasEntitlement').mockResolvedValue(true);
      jest
        .spyOn(service as any, 'getIssuerForOidc')
        .mockResolvedValue(mockIssuer);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(mockSavedProvider as any);

      const result = await service.createOidcIdentityProvider(
        data,
        workspaceId,
      );

      expect(result).toEqual({
        id: 'provider-123',
        type: 'Oidc',
        name: 'Test Provider',
        status: 'ACTIVE',
        issuer: 'https://example.com',
      });

      expect(billingService.hasEntitlement).toHaveBeenCalledWith(
        workspaceId,
        'Sso',
      );
      expect(repository.save).toHaveBeenCalledWith({
        type: 'Oidc',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        issuer: 'https://example.com',
        name: 'Test Provider',
        workspaceId,
      });
    });

    it('should throw an exception when Sso is disabled', async () => {
      const workspaceId = 'workspace-123';
      const data = {
        issuer: 'https://example.com',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        name: 'Test Provider',
      };

      jest.spyOn(billingService, 'hasEntitlement').mockResolvedValue(false);

      const result = await service.createOidcIdentityProvider(
        data,
        workspaceId,
      );

      expect(result).toBeInstanceOf(SsoException);
    });
  });

  describe('deleteSsoIdentityProvider', () => {
    it('should delete the identity provider successfully', async () => {
      const identityProviderId = 'provider-123';
      const workspaceId = 'workspace-123';
      const mockProvider = { id: identityProviderId };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProvider as any);
      jest.spyOn(repository, 'delete').mockResolvedValue(null as any);

      const result = await service.deleteSsoIdentityProvider(
        identityProviderId,
        workspaceId,
      );

      expect(result).toEqual({ identityProviderId: 'provider-123' });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: identityProviderId, workspaceId },
      });
      expect(repository.delete).toHaveBeenCalledWith({
        id: identityProviderId,
      });
    });

    it('should throw an exception if the identity provider does not exist', async () => {
      const identityProviderId = 'provider-123';
      const workspaceId = 'workspace-123';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteSsoIdentityProvider(identityProviderId, workspaceId),
      ).rejects.toThrow(SsoException);
    });
  });

  describe('getAuthorizationUrlForSso', () => {
    it('should return an authorization Url', async () => {
      const identityProviderId = 'provider-123';
      const searchParams = { client: 'web' };
      const mockIdentityProvider = {
        id: 'provider-123',
        type: 'Oidc',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockIdentityProvider as any);
      jest
        .spyOn(service as any, 'buildIssuerURL')
        .mockReturnValue('https://example.com/auth');

      const result = await service.getAuthorizationUrlForSso(
        identityProviderId,
        searchParams,
      );

      expect(result).toEqual({
        id: 'provider-123',
        authorizationURL: 'https://example.com/auth',
        type: 'Oidc',
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: identityProviderId },
      });
    });

    it('should throw an exception if the identity provider is not found', async () => {
      const identityProviderId = 'provider-123';
      const searchParams = {};

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getAuthorizationUrlForSso(identityProviderId, searchParams),
      ).rejects.toThrow(SsoException);
    });
  });
});
