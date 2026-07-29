import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('CustomDomainManagerService', () => {
  let service: CustomDomainManagerService;
  let dnsManagerService: DnsManagerService;
  let workspaceRepository: { save: jest.Mock };

  beforeEach(async () => {
    workspaceRepository = { save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomDomainManagerService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: getRepositoryToken(PublicDomainEntity),
          useValue: { findOneBy: jest.fn() },
        },
        {
          provide: BillingService,
          useValue: { hasEntitlement: jest.fn() },
        },
        {
          provide: DnsManagerService,
          useValue: {
            getHostnameWithRecords: jest.fn(),
            isHostnameWorking: jest.fn(),
          },
        },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: jest.fn().mockReturnValue({
              insertWorkspaceEvent: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CustomDomainManagerService>(
      CustomDomainManagerService,
    );
    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
  });

  describe('checkCustomDomainValidRecords', () => {
    it('should derive isWorking from getHostnameWithRecords without ever calling isHostnameWorking again', async () => {
      const workspace = {
        id: 'workspace-id',
        customDomain: 'example.com',
        isCustomDomainEnabled: false,
      } as WorkspaceEntity;

      jest
        .spyOn(dnsManagerService, 'getHostnameWithRecords')
        .mockResolvedValueOnce({
          id: 'custom-id',
          domain: 'example.com',
          records: [],
          isWorking: true,
        });

      const result = await service.checkCustomDomainValidRecords(workspace);

      expect(result.isCustomDomainEnabled).toBe(true);
      expect(workspace.isCustomDomainEnabled).toBe(true);
      expect(workspaceRepository.save).toHaveBeenCalledWith(workspace);
    });

    it('should not persist the workspace when the working status is unchanged', async () => {
      const workspace = {
        id: 'workspace-id',
        customDomain: 'example.com',
        isCustomDomainEnabled: true,
      } as WorkspaceEntity;

      jest
        .spyOn(dnsManagerService, 'getHostnameWithRecords')
        .mockResolvedValueOnce({
          id: 'custom-id',
          domain: 'example.com',
          records: [],
          isWorking: true,
        });

      await service.checkCustomDomainValidRecords(workspace);

      expect(workspaceRepository.save).not.toHaveBeenCalled();
    });

    // This PR's fix is specifically about reducing Cloudflare API calls, so
    // asserting call counts here isn't testing incidental implementation —
    // it's the observable behavior this change delivers (one Cloudflare
    // lookup per check instead of two).
    it('should only make a single Cloudflare lookup when no pre-fetched record is passed in', async () => {
      const workspace = {
        id: 'workspace-id',
        customDomain: 'example.com',
        isCustomDomainEnabled: false,
      } as WorkspaceEntity;

      jest
        .spyOn(dnsManagerService, 'getHostnameWithRecords')
        .mockResolvedValueOnce({
          id: 'custom-id',
          domain: 'example.com',
          records: [],
          isWorking: true,
        });

      await service.checkCustomDomainValidRecords(workspace);

      expect(dnsManagerService.getHostnameWithRecords).toHaveBeenCalledTimes(1);
      expect(dnsManagerService.isHostnameWorking).not.toHaveBeenCalled();
    });

    it('should reflect the working status returned after a refreshHostname() call, not the pre-refresh snapshot', async () => {
      const workspace = {
        id: 'workspace-id',
        customDomain: 'example.com',
        isCustomDomainEnabled: false,
      } as WorkspaceEntity;

      // refreshHostname() returns this snapshot from *before* it triggers its
      // Cloudflare edit() call, so its isWorking value is stale by the time
      // it reaches us and must not be trusted directly.
      const staleSnapshotFromRefresh = {
        id: 'custom-id',
        domain: 'example.com',
        records: [],
        isWorking: false,
      };

      jest
        .spyOn(dnsManagerService, 'isHostnameWorking')
        .mockResolvedValueOnce(true);

      const result = await service.checkCustomDomainValidRecords(
        workspace,
        staleSnapshotFromRefresh,
      );

      expect(result.isCustomDomainEnabled).toBe(true);
      expect(workspace.isCustomDomainEnabled).toBe(true);
    });
  });
});
