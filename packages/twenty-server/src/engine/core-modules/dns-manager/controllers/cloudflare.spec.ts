import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Request, type Response } from 'express';
import { AuditContextMock } from 'test/utils/audit-context.mock';
import { type Repository } from 'typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { CloudflareController } from 'src/engine/core-modules/dns-manager/controllers/cloudflare.controller';
import { type HostnameValidRecords } from 'src/engine/core-modules/dns-manager/dtos/hostname-valid-records';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';

describe('CloudflareController - customHostnameWebhooks', () => {
  let controller: CloudflareController;
  let WorkspaceRepository: Repository<Workspace>;
  let twentyConfigService: TwentyConfigService;
  let dnsManagerService: DnsManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudflareController],
      providers: [
        {
          provide: getRepositoryToken(Workspace),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DnsManagerService,
          useValue: {
            isCustomDomainWorking: jest.fn(),
          },
        },
        {
          provide: DnsManagerService,
          useValue: {
            getHostnameDetails: jest.fn(),
          },
        },
        {
          provide: HttpExceptionHandlerService,
          useValue: {
            handleError: jest.fn(),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: {
            captureExceptions: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            createContext: AuditContextMock,
          },
        },
      ],
    }).compile();

    controller = module.get<CloudflareController>(CloudflareController);
    WorkspaceRepository = module.get(getRepositoryToken(Workspace));
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
  });

  it('should handle exception and return status 200 if hostname is missing', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: { data: { data: {} } },
    } as unknown as Request;
    const sendMock = jest.fn();
    const res = {
      status: jest.fn().mockReturnThis(),
      send: sendMock,
    } as unknown as Response;

    jest.spyOn(twentyConfigService, 'get').mockReturnValue('correct-secret');

    await controller.customHostnameWebhooks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalled();
  });

  it('should update workspace for a valid hostname and save changes', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: { data: { data: { hostname: 'example.com' } } },
    } as unknown as Request;
    const sendMock = jest.fn();
    const res = {
      status: jest.fn().mockReturnThis(),
      send: sendMock,
    } as unknown as Response;

    jest.spyOn(twentyConfigService, 'get').mockReturnValue('correct-secret');
    jest.spyOn(dnsManagerService, 'getHostnameDetails').mockResolvedValue({
      records: [
        {
          success: true,
        },
      ],
    } as unknown as HostnameValidRecords);
    jest.spyOn(dnsManagerService, 'isHostnameWorking').mockResolvedValue(true);
    jest.spyOn(WorkspaceRepository, 'findOneBy').mockResolvedValue({
      customDomain: 'example.com',
      isCustomDomainEnabled: false,
    } as Workspace);

    await controller.customHostnameWebhooks(req, res);

    expect(WorkspaceRepository.findOneBy).toHaveBeenCalledWith({
      customDomain: 'example.com',
    });
    expect(dnsManagerService.getHostnameDetails).toHaveBeenCalledWith(
      'example.com',
    );
    expect(WorkspaceRepository.save).toHaveBeenCalledWith({
      customDomain: 'example.com',
      isCustomDomainEnabled: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalled();
  });

  it('should remove customDomain if no hostname found', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: { data: { data: { hostname: 'notfound.com' } } },
    } as unknown as Request;
    const sendMock = jest.fn();
    const res = {
      status: jest.fn().mockReturnThis(),
      send: sendMock,
    } as unknown as Response;

    jest.spyOn(twentyConfigService, 'get').mockReturnValue('correct-secret');
    jest.spyOn(WorkspaceRepository, 'findOneBy').mockResolvedValue({
      customDomain: 'notfound.com',
      isCustomDomainEnabled: true,
    } as Workspace);

    jest
      .spyOn(dnsManagerService, 'getHostnameDetails')
      .mockResolvedValue(undefined);

    await controller.customHostnameWebhooks(req, res);

    expect(WorkspaceRepository.findOneBy).toHaveBeenCalledWith({
      customDomain: 'notfound.com',
    });
    expect(WorkspaceRepository.save).toHaveBeenCalledWith({
      customDomain: null,
      isCustomDomainEnabled: false,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalled();
  });
  it('should do nothing if nothing changes', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: { data: { data: { hostname: 'nothing-change.com' } } },
    } as unknown as Request;
    const sendMock = jest.fn();
    const res = {
      status: jest.fn().mockReturnThis(),
      send: sendMock,
    } as unknown as Response;

    jest.spyOn(twentyConfigService, 'get').mockReturnValue('correct-secret');
    jest.spyOn(WorkspaceRepository, 'findOneBy').mockResolvedValue({
      customDomain: 'nothing-change.com',
      isCustomDomainEnabled: true,
    } as Workspace);
    jest.spyOn(dnsManagerService, 'getHostnameDetails').mockResolvedValue({
      records: [
        {
          success: true,
        },
      ],
    } as unknown as HostnameValidRecords);
    jest.spyOn(dnsManagerService, 'isHostnameWorking').mockResolvedValue(true);

    await controller.customHostnameWebhooks(req, res);

    expect(WorkspaceRepository.findOneBy).toHaveBeenCalledWith({
      customDomain: 'nothing-change.com',
    });
    expect(WorkspaceRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalled();
  });
});
