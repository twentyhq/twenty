import { Body, Controller, Post, Headers, Param } from '@nestjs/common';

import {
  ExternalEventException,
  ExternalEventExceptionCode,
} from './external-event.exception';

import {
  ExternalEventInput,
  ExternalEventService,
} from './services/external-event.service';
import { ExternalEventTokenService } from './services/external-event-token.service';

@Controller('external-event')
export class ExternalEventController {
  constructor(
    private readonly externalEventService: ExternalEventService,
    private readonly externalEventTokenService: ExternalEventTokenService,
  ) {}

  @Post(':workspaceId')
  async createExternalEvent(
    @Param('workspaceId') workspaceId: string,
    @Headers('authorization') authHeader: string,
    @Body() externalEventInput: ExternalEventInput,
  ) {
    // Extract API key from Authorization header
    if (!authHeader) {
      throw new ExternalEventException(
        'Missing authorization header',
        ExternalEventExceptionCode.INVALID_AUTH,
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Validate token
    const isValidAppToken = await this.externalEventTokenService.validateToken(
      workspaceId,
      apiKey,
    );

    if (!isValidAppToken) {
      throw new ExternalEventException(
        'Invalid authorization',
        ExternalEventExceptionCode.INVALID_AUTH,
      );
    }

    const result = await this.externalEventService.createExternalEvent(
      workspaceId,
      externalEventInput,
    );

    if (!result.success) {
      throw new ExternalEventException(
        'Failed to create external event',
        ExternalEventExceptionCode.CLICKHOUSE_ERROR,
      );
    }

    return { success: true };
  }
}
