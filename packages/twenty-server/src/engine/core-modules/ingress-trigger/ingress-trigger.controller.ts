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

import { IngressTriggerRestApiExceptionFilter } from 'src/engine/core-modules/ingress-trigger/exceptions/ingress-trigger-rest-api-exception-filter';
import { IngressTriggerService } from 'src/engine/core-modules/ingress-trigger/ingress-trigger.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { sendRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';

@Controller('webhooks/ingress')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(IngressTriggerRestApiExceptionFilter)
export class IngressTriggerController {
  constructor(
    private readonly ingressTriggerService: IngressTriggerService,
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
      await this.ingressTriggerService.handle({
        request,
        applicationRegistrationUniversalIdentifier,
        logicFunctionUniversalIdentifier,
      }),
    );
  }
}
