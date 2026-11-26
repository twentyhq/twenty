import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainExceptionCode } from 'src/engine/core-modules/public-domain/public-domain.exception';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const CONFIG: Record<string, string | undefined> = {
  FRONTEND_URL: 'https://app.example.org',
  SERVER_URL: 'https://api.example.net',
  PUBLIC_DOMAIN_URL: 'https://withtwenty.com',
};

describe('PublicDomainService', () => {
  let publicDomainService: PublicDomainService;

  const dnsManagerService = {
    registerHostname: jest.fn(),
    deleteHostnameSilently: jest.fn(),
  };
  const publicDomainRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    insert: jest.fn(),
  };
  const workspaceRepository = { findOneBy: jest.fn().mockResolvedValue(null) };
  const applicationRepository = {
    findOneBy: jest.fn().mockResolvedValue({ id: 'application-id' }),
  };

  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicDomainService,
        DomainServerConfigService,
        {
          provide: TwentyConfigService,
          useValue: { get: (key: string) => CONFIG[key] },
        },
        { provide: DnsManagerService, useValue: dnsManagerService },
        {
          provide: getWorkspaceScopedRepositoryToken(PublicDomainEntity),
          useValue: publicDomainRepository,
        },
        { provide: getRepositoryToken(PublicDomainEntity), useValue: {} },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
      ],
    }).compile();

    publicDomainService = module.get(PublicDomainService);
  });

  it.each([
    'app.example.org',
    'acme.app.example.org',
    'api.example.net',
    'withtwenty.com',
    'acme.withtwenty.com',
    ' API.Example.NET ',
  ])(
    'refuses %s before registering it with the DNS provider',
    async (domain) => {
      await expect(
        publicDomainService.createPublicDomain({
          domain,
          workspace,
          applicationId: 'application-id',
        }),
      ).rejects.toMatchObject({
        code: PublicDomainExceptionCode.DOMAIN_USED_BY_INSTANCE,
      });

      expect(dnsManagerService.registerHostname).not.toHaveBeenCalled();
      expect(publicDomainRepository.insert).not.toHaveBeenCalled();
    },
  );

  it('registers a domain outside the instance hosts', async () => {
    await publicDomainService.createPublicDomain({
      domain: 'donate.charity.org',
      workspace,
      applicationId: 'application-id',
    });

    expect(dnsManagerService.registerHostname).toHaveBeenCalledWith(
      'donate.charity.org',
      { isPublicDomain: true },
    );
    expect(publicDomainRepository.insert).toHaveBeenCalledTimes(1);
  });
});
