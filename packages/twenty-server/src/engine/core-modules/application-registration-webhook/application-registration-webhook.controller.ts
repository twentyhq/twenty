import {
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { ApplicationRegistrationWebhookRestApiExceptionFilter } from 'src/engine/core-modules/application-registration-webhook/exceptions/application-registration-webhook-rest-api-exception-filter';
import { ApplicationRegistrationWebhookService } from 'src/engine/core-modules/application-registration-webhook/application-registration-webhook.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { sendRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';

@Controller('webhooks/application-registrations')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(ApplicationRegistrationWebhookRestApiExceptionFilter)
export class ApplicationRegistrationWebhookController {
  constructor(
    private readonly applicationRegistrationWebhookService: ApplicationRegistrationWebhookService,
  ) {}

  @Post(':applicationRegistrationUniversalIdentifier/:logicFunctionUniversalIdentifier')
  async post(
    @Param('applicationRegistrationUniversalIdentifier')
    applicationRegistrationUniversalIdentifier: string,
    @Param('logicFunctionUniversalIdentifier')
    logicFunctionUniversalIdentifier: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    sendRouteTriggerResponse(
      response,
      await this.applicationRegistrationWebhookService.handle({
        request,
        applicationRegistrationUniversalIdentifier,
        logicFunctionUniversalIdentifier,
      }),
    );
  }
}
