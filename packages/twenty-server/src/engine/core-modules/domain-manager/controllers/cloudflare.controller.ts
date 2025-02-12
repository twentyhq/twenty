import { Controller, Post, Req, Res, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Response } from 'express';
import { Repository } from 'typeorm';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { handleException } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Controller('cloudflare')
@UseFilters(AuthRestApiExceptionFilter)
export class CloudflareController {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly domainManagerService: DomainManagerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Post('custom-hostname-webhooks')
  async customHostnameWebhooks(@Req() req: any, @Res() res: Response) {
    const cloudflareWebhookSecret = this.environmentService.get(
      'CLOUDFLARE_WEBHOOK_SECRET',
    );

    if (
      cloudflareWebhookSecret &&
      req.headers['cf-webhook-auth'] !== cloudflareWebhookSecret
    ) {
      throw new DomainManagerException(
        'Invalid secret',
        DomainManagerExceptionCode.INVALID_INPUT_DATA,
      );
    }

    if (!req.body?.data?.data?.hostname) {
      handleException(
        new DomainManagerException(
          'Hostname missing',
          DomainManagerExceptionCode.INVALID_INPUT_DATA,
        ),
        this.exceptionHandlerService,
      );

      return res.status(200).send();
    }

    const workspace = await this.workspaceRepository.findOneBy({
      customDomain: req.body.data.data.hostname,
    });

    if (!workspace) return;

    const customDomainDetails =
      await this.domainManagerService.getCustomDomainDetails(
        req.body.data.data.hostname,
      );

    const workspaceUpdated: Partial<Workspace> = {
      customDomain: workspace.customDomain,
    };

    if (!customDomainDetails && workspace) {
      workspaceUpdated.customDomain = null;
    }

    workspaceUpdated.isCustomDomainEnabled = customDomainDetails
      ? this.domainManagerService.isCustomDomainWorking(customDomainDetails)
      : false;

    if (
      workspaceUpdated.isCustomDomainEnabled !==
        workspace.isCustomDomainEnabled ||
      workspaceUpdated.customDomain !== workspace.customDomain
    ) {
      await this.workspaceRepository.save({
        ...workspace,
        ...workspaceUpdated,
      });
    }

    return res.status(200).send();
  }
}
