import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { sendRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { SERVER_ROUTE_LEGACY_IDENTIFIER_DEPRECATION_HEADER_VALUE } from 'src/engine/core-modules/server-route-trigger/constants/server-route-legacy-identifier-deprecation-header-value.constant';
import { ServerRouteTriggerRestApiExceptionFilter } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger-rest-api-exception-filter';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { UsageLimitRestApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-rest-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(`${ApiPath.Webhooks}/server`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(
  ServerRouteTriggerRestApiExceptionFilter,
  UsageLimitRestApiExceptionFilter,
  BillingRestApiExceptionFilter,
)
export class ServerRouteTriggerController {
  constructor(
    private readonly serverRouteTriggerService: ServerRouteTriggerService,
  ) {}

  private async handleRequest(
    resolverLogicFunctionIdentifier: string,
    request: Request,
    response: Response,
  ) {
    const { response: triggerResponse, isResolvedThroughLegacyIdentifier } =
      await this.serverRouteTriggerService.handle({
        request,
        resolverLogicFunctionIdentifier,
      });

    if (isResolvedThroughLegacyIdentifier) {
      response.setHeader(
        'Deprecation',
        SERVER_ROUTE_LEGACY_IDENTIFIER_DEPRECATION_HEADER_VALUE,
      );
    }

    sendRouteTriggerResponse(response, triggerResponse);
  }

  @Get(':resolverLogicFunctionIdentifier')
  async get(
    @Param('resolverLogicFunctionIdentifier')
    resolverLogicFunctionIdentifier: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.handleRequest(
      resolverLogicFunctionIdentifier,
      request,
      response,
    );
  }

  @Post(':resolverLogicFunctionIdentifier')
  async post(
    @Param('resolverLogicFunctionIdentifier')
    resolverLogicFunctionIdentifier: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.handleRequest(
      resolverLogicFunctionIdentifier,
      request,
      response,
    );
  }
}
