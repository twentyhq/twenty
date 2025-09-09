/* @license Enterprise */

import { Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/dns-manager/guards/cloudflare-secret.guard';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DnsManagerExceptionFilter } from 'src/engine/core-modules/dns-manager/exceptions/dns-manager-exception-filter';

@Controller()
@UseFilters(AuthRestApiExceptionFilter, DnsManagerExceptionFilter)
export class DnsCloudflareController {
  constructor(
    protected readonly domainManagerService: DomainManagerService,
    protected readonly dnsManagerService: DnsManagerService,
  ) {}

  @Post(['cloudflare/custom-hostname-webhooks', 'webhooks/cloudflare'])
  @UseGuards(CloudflareSecretMatchGuard, PublicEndpointGuard)
  async customHostnameWebhooks(@Req() req: Request) {
    const alertType = req.body?.alert_type;

    const hostname = req.body?.data?.data?.hostname;

    if (alertType !== 'custom_ssl_certificate_event_type' || !hostname) {
      return;
    }

    try {
      const isCustomDomainWorking =
        await this.dnsManagerService.isHostnameWorking(hostname);

      await this.domainManagerService.handleCustomDomainActivation({
        customDomain: hostname,
        isCustomDomainWorking,
      });
    } catch {
      return;
    }
  }
}
