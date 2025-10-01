/* @license Enterprise */

import { Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { DnsManagerExceptionFilter } from 'src/engine/core-modules/dns-manager/exceptions/dns-manager-exception-filter';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/cloudflare/guards/cloudflare-secret.guard';
import { DnsCloudflareService } from 'src/engine/core-modules/cloudflare/services/dns-cloudflare.service';

@Controller()
@UseFilters(AuthRestApiExceptionFilter, DnsManagerExceptionFilter)
export class DnsCloudflareController {
  constructor(protected readonly dnsCloudflareService: DnsCloudflareService) {}

  @Post(['cloudflare/custom-hostname-webhooks', 'webhooks/cloudflare'])
  @UseGuards(CloudflareSecretMatchGuard, PublicEndpointGuard)
  async customHostnameWebhooks(@Req() req: Request) {
    const hostname = req.body?.data?.data?.hostname;

    if (!hostname) {
      return;
    }

    try {
      await this.dnsCloudflareService.checkHostname(hostname);
    } catch {
      return;
    }
  }
}
