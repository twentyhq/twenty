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
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationWebhookRestApiExceptionFilter } from 'src/engine/core-modules/application-registration-webhook/exceptions/application-registration-webhook-rest-api-exception-filter';
import { ApplicationRegistrationWebhookService } from 'src/engine/core-modules/application-registration-webhook/application-registration-webhook.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';

const ALLOWED_RESPONSE_HEADERS = new Set([
  'content-type',
  'content-language',
  'content-disposition',
  'cache-control',
  'retry-after',
]);

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
    this.sendResponse(
      response,
      await this.applicationRegistrationWebhookService.handle({
        request,
        applicationRegistrationUniversalIdentifier,
        logicFunctionUniversalIdentifier,
      }),
    );
  }

  private sendResponse(
    response: Response,
    { statusCode, headers, body }: RouteTriggerResponse,
  ) {
    response.status(statusCode);

    for (const [key, value] of Object.entries(headers)) {
      if (ALLOWED_RESPONSE_HEADERS.has(key.toLowerCase())) {
        response.setHeader(key, value);
      }
    }

    if (!isDefined(body)) {
      response.send();

      return;
    }

    const hasContentType = isDefined(response.getHeader('content-type'));

    if (typeof body === 'string') {
      if (!hasContentType) {
        response.setHeader('content-type', 'text/plain');
      }

      response.send(body);

      return;
    }

    if (hasContentType) {
      response.send(JSON.stringify(body));

      return;
    }

    response.json(body);
  }
}
