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

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/domain-manager/guards/cloudflare-secret.guard';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { handleException } from 'src/engine/utils/global-exception-handler.util';
@Controller()
@UseFilters(AuthRestApiExceptionFilter)
export class CloudflareController {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly domainManagerService: DomainManagerService,
    private readonly customDomainService: CustomDomainService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly auditService: AuditService,
  ) {}

  @Post(['cloudflare/custom-hostname-webhooks', 'webhooks/cloudflare'])
  @UseGuards(CloudflareSecretMatchGuard, PublicEndpointGuard)
  async customHostnameWebhooks(@Req() req: Request, @Res() res: Response) {
    try {
      // Cloudflare documentation is inaccurate - some webhooks lack the hostname field.
      // Fallback to extracting hostname from validation_records.
      const hostname =
        req.body?.data?.data?.hostname ??
        req.body?.data?.data?.ssl?.validation_records?.[0]?.txt_name?.replace(
          /^_acme-challenge\./,
          '',
        );

      if (!hostname) {
        handleException({
          exception: new DomainManagerException(
            'Hostname missing',
            DomainManagerExceptionCode.INVALID_INPUT_DATA,
            { userFriendlyMessage: 'Hostname missing' },
          ),
          exceptionHandlerService: this.exceptionHandlerService,
        });

        return res.status(200).send();
      }

      const workspace = await this.workspaceRepository.findOneBy({
        customDomain: hostname,
      });

      if (!workspace) return;

      const analytics = this.auditService.createContext({
        workspaceId: workspace.id,
      });

      const customDomainDetails =
        await this.customDomainService.getCustomDomainDetails(hostname);

      const workspaceUpdated: Partial<Workspace> = {
        customDomain: workspace.customDomain,
      };

      if (!customDomainDetails) {
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

        await analytics.insertWorkspaceEvent(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});
      }

      return res.status(200).send();
    } catch (err) {
      handleException({
        exception: new DomainManagerException(
          err.message ?? 'Unknown error occurred',
          DomainManagerExceptionCode.INTERNAL_SERVER_ERROR,
          { userFriendlyMessage: 'Unknown error occurred' },
        ),
        exceptionHandlerService: this.exceptionHandlerService,
      });

      return res.status(200).send();
    }
  }
}
