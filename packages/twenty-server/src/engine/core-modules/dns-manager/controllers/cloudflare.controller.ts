/* @license Enterprise */

import {
  Controller,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { handleException } from 'src/engine/utils/global-exception-handler.util';
import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/dns-manager/guards/cloudflare-secret.guard';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';

@Controller()
@UseFilters(AuthRestApiExceptionFilter)
export class CloudflareController {
  constructor(
    protected readonly domainManagerService: DomainManagerService,
    protected readonly dnsManagerService: DnsManagerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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
          exception: new DnsManagerException(
            'Hostname missing',
            DnsManagerExceptionCode.INVALID_INPUT_DATA,
            { userFriendlyMessage: 'Hostname missing' },
          ),
          exceptionHandlerService: this.exceptionHandlerService,
        });

        return res.status(200).send();
      }

      await this.domainManagerService.handleCustomDomainActivation({
        customDomain: hostname,
        isCustomDomainWorking:
          await this.dnsManagerService.isHostnameWorking(hostname),
      });

      return res.status(200).send();
    } catch (err) {
      handleException({
        exception: new DnsManagerException(
          err.message ?? 'Unknown error occurred',
          DnsManagerExceptionCode.INTERNAL_SERVER_ERROR,
          { userFriendlyMessage: 'Unknown error occurred' },
        ),
        exceptionHandlerService: this.exceptionHandlerService,
      });

      return res.status(200).send();
    }
  }
}
