import { Test, type TestingModule } from '@nestjs/testing';

import { type Request } from 'express';

import { DnsCloudflareController } from 'src/engine/core-modules/dns-manager/controllers/dns-cloudflare.controller';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

describe('DnsCloudflareController - customHostnameWebhooks', () => {
  let controller: DnsCloudflareController;
  let dnsManagerService: DnsManagerService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnsCloudflareController],
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

    controller = module.get<DnsCloudflareController>(DnsCloudflareController);
    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
  });

  it('should return if hostname is missing', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: { data: { data: {} } },
    } as unknown as Request;

    await controller.customHostnameWebhooks(req);

    expect(dnsManagerService.isHostnameWorking).not.toHaveBeenCalled();
  });

  it('should return if wrong alert_type', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: { alert_type: 'wrong_alert_type', data: { data: {} } },
    } as unknown as Request;

    await controller.customHostnameWebhooks(req);

    expect(dnsManagerService.isHostnameWorking).not.toHaveBeenCalled();
  });

  it('should update workspace for a valid hostname and save changes', async () => {
    const req = {
      headers: { 'cf-webhook-auth': 'correct-secret' },
      body: {
        alert_type: 'custom_ssl_certificate_event_type',
        data: { data: { hostname: 'example.com' } },
      },
    } as unknown as Request;

    jest.spyOn(dnsManagerService, 'isHostnameWorking').mockResolvedValue(true);

    await controller.customHostnameWebhooks(req);

    expect(dnsManagerService.isHostnameWorking).toHaveBeenCalled();

    expect(
      domainManagerService.handleCustomDomainActivation,
    ).toHaveBeenCalledWith({
      customDomain: 'example.com',
      isCustomDomainWorking: true,
    });
  });
});
