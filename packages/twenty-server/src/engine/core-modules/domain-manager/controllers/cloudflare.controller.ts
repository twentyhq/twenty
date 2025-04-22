/* @license Enterprise */

import {
  Controller,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request, Response } from 'express';
import { Repository } from 'typeorm';

import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/custom-domain/custom-domain-activated';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/domain-manager/guards/cloudflare-secret.guard';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Controller()
@UseFilters(AuthRestApiExceptionFilter)
export class CloudflareController {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly domainManagerService: DomainManagerService,
    private readonly customDomainService: CustomDomainService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post(['cloudflare/custom-hostname-webhooks', 'webhooks/cloudflare'])
  @UseGuards(CloudflareSecretMatchGuard)
  async customHostnameWebhooks(@Req() req: Request, @Res() res: Response) {
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

    const analytics = this.analyticsService.createAnalyticsContext({
      workspaceId: workspace.id,
    });

    const customDomainDetails =
      await this.customDomainService.getCustomDomainDetails(
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

      await analytics.track(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});
    }

    return res.status(200).send();
  }
}
