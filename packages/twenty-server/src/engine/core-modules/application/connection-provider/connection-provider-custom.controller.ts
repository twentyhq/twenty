import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request, type Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { ConnectionProviderCustomFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-custom-flow.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderFlowRedirectService } from 'src/engine/core-modules/application/connection-provider/connection-provider-flow-redirect.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderRestApiExceptionFilter } from 'src/engine/core-modules/application/connection-provider/filters/connection-provider-rest-api-exception.filter';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { LogicFunctionExecutionRestApiExceptionFilter } from 'src/engine/core-modules/logic-function/logic-function-executor/filters/logic-function-execution-rest-api-exception.filter';
import {
  extractBody,
  extractRawBody,
  filterRequestHeaders,
  normalizeQueryStringParameters,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import { UsageLimitRestApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-rest-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller(`${ApiPath.Auth}/apps/custom`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class ConnectionProviderCustomController {
  constructor(
    private readonly customFlowService: ConnectionProviderCustomFlowService,
    private readonly flowRedirectService: ConnectionProviderFlowRedirectService,
  ) {}

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    let state: string | undefined;

    try {
      const callbackRequest = this.readCallbackRequestOrThrow(req);

      state = callbackRequest.state;

      const { workspaceId, applicationId, redirectLocation } =
        await this.customFlowService.completeAuthorizationFlow({
          state,
          request: {
            httpMethod: 'GET',
            queryStringParameters: callbackRequest.queryStringParameters,
            headers: callbackRequest.headers,
            body: null,
            rawBody: null,
          },
        });

      return await this.flowRedirectService.redirectToConnectedApplication({
        res,
        workspaceId,
        applicationId,
        redirectLocation,
      });
    } catch (error) {
      return this.flowRedirectService.redirectToErrorFromState({
        res,
        state,
        error,
      });
    }
  }

  @Post('callback')
  @HttpCode(200)
  @UseFilters(
    ConnectionProviderRestApiExceptionFilter,
    PermissionsRestApiExceptionFilter,
    LogicFunctionExecutionRestApiExceptionFilter,
    UsageLimitRestApiExceptionFilter,
    BillingRestApiExceptionFilter,
  )
  async callbackNotification(@Req() req: Request): Promise<{ success: true }> {
    const { state, queryStringParameters, headers } =
      this.readCallbackRequestOrThrow(req);

    await this.customFlowService.completeAuthorizationFlow({
      state,
      request: {
        httpMethod: 'POST',
        queryStringParameters,
        headers,
        body: extractBody(req),
        rawBody: extractRawBody(req) ?? null,
      },
    });

    return { success: true };
  }

  private readCallbackRequestOrThrow(req: Request): {
    state: string;
    queryStringParameters: Record<string, string | undefined>;
    headers: Record<string, string | undefined>;
  } {
    const { state, ...queryStringParameters } = normalizeQueryStringParameters(
      req.query,
    );

    if (!isNonEmptyString(state)) {
      throw new ConnectionProviderException(
        'Custom connection callback is missing the `state` query parameter',
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    return {
      state,
      queryStringParameters,
      headers: filterRequestHeaders({
        requestHeaders: req.headers,
        forwardedRequestHeaders: [],
        forwardAllHeaders: true,
      }),
    };
  }
}
