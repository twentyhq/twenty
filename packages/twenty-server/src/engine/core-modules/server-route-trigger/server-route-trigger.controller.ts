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

import { sendRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { ServerRouteTriggerRestApiExceptionFilter } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger-rest-api-exception-filter';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('webhooks/server')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(ServerRouteTriggerRestApiExceptionFilter)
export class ServerRouteTriggerController {
  constructor(
    private readonly serverRouteTriggerService: ServerRouteTriggerService,
  ) {}

  @Post(':resolverLogicFunctionUniversalIdentifier')
  async post(
    @Param('resolverLogicFunctionUniversalIdentifier')
    resolverLogicFunctionUniversalIdentifier: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    sendRouteTriggerResponse(
      response,
      await this.serverRouteTriggerService.handle({
        request,
        resolverLogicFunctionUniversalIdentifier,
      }),
    );
  }
}
