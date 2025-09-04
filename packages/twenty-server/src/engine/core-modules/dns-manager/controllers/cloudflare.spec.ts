import { Test, type TestingModule } from '@nestjs/testing';

import { type Request, type Response } from 'express';

import { CloudflareController } from 'src/engine/core-modules/dns-manager/controllers/cloudflare.controller';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

describe('CloudflareController - customHostnameWebhooks', () => {
  let controller: CloudflareController;
  let twentyConfigService: TwentyConfigService;
  let dnsManagerService: DnsManagerService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudflareController],
      providers: [
        {
          provide: DomainManagerService,
          useValue: {
            handleCustomDomainActivation: jest.fn(),
          },
        },
        {
          provide: DnsManagerService,
          useValue: {
            isHostnameWorking: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<CloudflareController>(CloudflareController);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
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
    jest.spyOn(dnsManagerService, 'isHostnameWorking').mockResolvedValue(true);

    await controller.customHostnameWebhooks(req, res);

    expect(
      domainManagerService.handleCustomDomainActivation,
    ).toHaveBeenCalledWith({
      customDomain: 'example.com',
      isCustomDomainWorking: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalled();
  });
});
