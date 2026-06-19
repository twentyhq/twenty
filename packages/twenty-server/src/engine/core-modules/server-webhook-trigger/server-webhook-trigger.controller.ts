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

import { ServerWebhookTriggerRestApiExceptionFilter } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger-rest-api-exception-filter';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { sendRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';

@Controller('webhooks/server')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(ServerWebhookTriggerRestApiExceptionFilter)
export class ServerWebhookTriggerController {
  constructor(
    private readonly serverWebhookTriggerService: ServerWebhookTriggerService,
  ) {}

  @Post(
    ':applicationRegistrationUniversalIdentifier/:logicFunctionUniversalIdentifier',
  )
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
      await this.serverWebhookTriggerService.handle({
        request,
        applicationRegistrationUniversalIdentifier,
        logicFunctionUniversalIdentifier,
      }),
    );
  }
}
