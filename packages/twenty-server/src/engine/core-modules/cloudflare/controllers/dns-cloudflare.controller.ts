/* @license Enterprise */

import { Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { DnsManagerExceptionFilter } from 'src/engine/core-modules/dns-manager/exceptions/dns-manager-exception-filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/cloudflare/guards/cloudflare-secret.guard';

@Controller()
@UseFilters(AuthRestApiExceptionFilter, DnsManagerExceptionFilter)
export class DnsCloudflareController {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    protected readonly workspaceService: WorkspaceService,
    @InjectRepository(PublicDomain)
    private readonly publicDomainRepository: Repository<PublicDomain>,
    protected readonly publicDomainService: PublicDomainService,
  ) {}

  @Post(['cloudflare/custom-hostname-webhooks', 'webhooks/cloudflare'])
  @UseGuards(CloudflareSecretMatchGuard, PublicEndpointGuard)
  async customHostnameWebhooks(@Req() req: Request) {
    const hostname = req.body?.data?.data?.hostname;

    if (!hostname) {
      return;
    }

    try {
      const workspace = await this.workspaceRepository.findOneBy({
        customDomain: hostname,
      });

      if (isDefined(workspace)) {
        await this.workspaceService.checkCustomDomainValidRecords(workspace);
      }

      const publicDomain = await this.publicDomainRepository.findOneBy({
        domain: hostname,
      });

      if (isDefined(publicDomain)) {
        await this.publicDomainService.checkPublicDomainValidRecords(
          publicDomain,
        );
      }
    } catch {
      return;
    }
  }
}
