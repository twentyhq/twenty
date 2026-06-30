import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOException } from 'src/engine/core-modules/sso/sso.exception';
import { WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('SSOService', () => {
  let service: SSOService;
  let repository: Repository<WorkspaceSSOIdentityProviderEntity>;
  let billingService: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SSOService,
        {
          provide: getRepositoryToken(WorkspaceSSOIdentityProviderEntity),
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

    service = module.get<SSOService>(SSOService);
    repository = module.get<Repository<WorkspaceSSOIdentityProviderEntity>>(
      getRepositoryToken(WorkspaceSSOIdentityProviderEntity),
    );
    billingService = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOIDCIdentityProvider', () => {
    it('should create an OIDC identity provider successfully', async () => {
      const workspaceId = 'workspace-123';
      const data = {
        issuer: 'https://example.com',
        clientID: 'client-id',
        clientSecret: 'client-secret',
        name: 'Test Provider',
      };
      const mockIssuer = { metadata: { issuer: 'https://example.com' } };
      const mockSavedProvider = {
        id: 'provider-123',
        type: 'OIDC',
        name: 'Test Provider',
        status: 'ACTIVE',
        issuer: 'https://example.com',
      };

      jest.spyOn(billingService, 'hasEntitlement').mockResolvedValue(true);
      jest
        .spyOn(service as any, 'getIssuerForOIDC')
        .mockResolvedValue(mockIssuer);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(mockSavedProvider as any);

      const result = await service.createOIDCIdentityProvider(
        data,
        workspaceId,
      );

      expect(result).toEqual({
        id: 'provider-123',
        type: 'OIDC',
        name: 'Test Provider',
        status: 'ACTIVE',
        issuer: 'https://example.com',
      });

      expect(billingService.hasEntitlement).toHaveBeenCalledWith(
        workspaceId,
        'SSO',
      );
      expect(repository.save).toHaveBeenCalledWith({
        type: 'OIDC',
        clientID: 'client-id',
        clientSecret: 'client-secret',
        issuer: 'https://example.com',
        name: 'Test Provider',
        workspaceId,
      });
    });

    it('should throw an exception when SSO is disabled', async () => {
      const workspaceId = 'workspace-123';
      const data = {
        issuer: 'https://example.com',
        clientID: 'client-id',
        clientSecret: 'client-secret',
        name: 'Test Provider',
      };

      jest.spyOn(billingService, 'hasEntitlement').mockResolvedValue(false);

      const result = await service.createOIDCIdentityProvider(
        data,
        workspaceId,
      );

      expect(result).toBeInstanceOf(SSOException);
    });
  });

  describe('deleteSSOIdentityProvider', () => {
    it('should delete the identity provider successfully', async () => {
      const identityProviderId = 'provider-123';
      const workspaceId = 'workspace-123';
      const mockProvider = { id: identityProviderId };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProvider as any);
      jest.spyOn(repository, 'delete').mockResolvedValue(null as any);

      const result = await service.deleteSSOIdentityProvider(
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
        service.deleteSSOIdentityProvider(identityProviderId, workspaceId),
      ).rejects.toThrow(SSOException);
    });
  });

  describe('getAuthorizationUrlForSSO', () => {
    it('should return an authorization URL', async () => {
      const identityProviderId = 'provider-123';
      const searchParams = { client: 'web' };
      const mockIdentityProvider = {
        id: 'provider-123',
        type: 'OIDC',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockIdentityProvider as any);
      jest
        .spyOn(service as any, 'buildIssuerURL')
        .mockReturnValue('https://example.com/auth');

      const result = await service.getAuthorizationUrlForSSO(
        identityProviderId,
        searchParams,
      );

      expect(result).toEqual({
        id: 'provider-123',
        authorizationURL: 'https://example.com/auth',
        type: 'OIDC',
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
        service.getAuthorizationUrlForSSO(identityProviderId, searchParams),
      ).rejects.toThrow(SSOException);
    });
  });
});
