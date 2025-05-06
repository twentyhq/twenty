import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ExternalEventInput } from 'src/engine/core-modules/external-event/dto/external-event.input';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

import {
  ExternalEventException,
  ExternalEventExceptionCode,
} from './external-event.exception';

import { ExternalEventTokenService } from './services/external-event-token.service';
import { ExternalEventService } from './services/external-event.service';
import { ExternalEventValidator } from './validators/external-event.validator';

@Controller('external-event')
export class ExternalEventController {
  constructor(
    private readonly externalEventService: ExternalEventService,
    private readonly externalEventTokenService: ExternalEventTokenService,
    private readonly externalEventValidator: ExternalEventValidator,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  @Post(':workspaceId')
  async createExternalEvent(
    @Param('workspaceId') workspaceId: string,
    @Headers('authorization') authHeader: string,
    @Body() externalEventInput: ExternalEventInput,
  ) {
    const isFeatureEnabled = await this.featureFlagRepository.findOne({
      where: {
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      },
    });

    if (!isFeatureEnabled) {
      throw new ExternalEventException(
        'External Event feature is not enabled for this workspace',
        ExternalEventExceptionCode.FEATURE_DISABLED,
      );
    }

    if (!authHeader) {
      throw new ExternalEventException(
        'Missing authorization header',
        ExternalEventExceptionCode.INVALID_AUTH,
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');

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

    this.externalEventValidator.validate(externalEventInput);

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
