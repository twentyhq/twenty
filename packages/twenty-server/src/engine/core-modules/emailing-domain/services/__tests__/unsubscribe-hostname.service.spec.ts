import { Test, type TestingModule } from '@nestjs/testing';

import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const EMAILING_DOMAIN_ID = '20202020-0f1e-4a6b-9c3d-2b7e5a8c1d44';

describe('UnsubscribeHostnameService', () => {
  let service: UnsubscribeHostnameService;

  const emailingDomainRepository = {
    findOneOrFail: jest.fn(),
    update: jest.fn(),
  };

  const dnsManagerService = {
    isConfigured: jest.fn(),
    registerHostname: jest.fn(),
    getHostnameWithRecords: jest.fn(),
    isHostnameWorking: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnsubscribeHostnameService,
        {
          provide: getWorkspaceScopedRepositoryToken(EmailingDomainEntity),
          useValue: emailingDomainRepository,
        },
        { provide: DnsManagerService, useValue: dnsManagerService },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://crm.example.com'),
          },
        },
      ],
    }).compile();

    service = module.get(UnsubscribeHostnameService);
  });

  describe('without Cloudflare', () => {
    beforeEach(() => {
      dnsManagerService.isConfigured.mockReturnValue(false);
    });

    it('serves unsubscribe links from the server host', async () => {
      await service.sync(WORKSPACE_ID, EMAILING_DOMAIN_ID, { provision: true });

      expect(emailingDomainRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: EMAILING_DOMAIN_ID },
        {
          unsubscribeHostname: 'crm.example.com',
          unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
        },
      );
      expect(dnsManagerService.registerHostname).not.toHaveBeenCalled();
    });

    it('asks for no unsubscribe DNS records', async () => {
      const records = await service.getDnsRecords({
        unsubscribeHostname: 'crm.example.com',
      } as EmailingDomainEntity);

      expect(records).toEqual([]);
      expect(dnsManagerService.getHostnameWithRecords).not.toHaveBeenCalled();
    });
  });

  describe('with Cloudflare', () => {
    beforeEach(() => {
      dnsManagerService.isConfigured.mockReturnValue(true);
    });

    it('registers unsubscribe.<domain> and waits for Cloudflare', async () => {
      emailingDomainRepository.findOneOrFail.mockResolvedValue({
        id: EMAILING_DOMAIN_ID,
        workspaceId: WORKSPACE_ID,
        domain: 'acme.com',
        unsubscribeHostname: null,
        unsubscribeHostnameId: null,
      });
      dnsManagerService.registerHostname.mockResolvedValue({ id: 'cf-id' });
      dnsManagerService.isHostnameWorking.mockResolvedValue(false);

      await service.sync(WORKSPACE_ID, EMAILING_DOMAIN_ID, { provision: true });

      expect(dnsManagerService.registerHostname).toHaveBeenCalledWith(
        'unsubscribe.acme.com',
      );
      expect(emailingDomainRepository.update).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
        }),
      );
    });
  });
});
