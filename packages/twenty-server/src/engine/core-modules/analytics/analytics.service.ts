import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { anonymize } from 'src/utils/anonymize';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

type CreateEventInput = {
  type: string;
  data: object;
};

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createEventInput: CreateEventInput,
    userId: string | undefined,
    workspaceId: string | undefined,
    workspaceDisplayName: string | undefined,
    workspaceDomainName: string | undefined,
    hostName: string | undefined,
  ) {
    if (!this.environmentService.get('TELEMETRY_ENABLED')) {
      return { success: true };
    }

    const anonymizationEnabled = this.environmentService.get(
      'TELEMETRY_ANONYMIZATION_ENABLED',
    );

    const data = {
      type: createEventInput.type,
      data: {
        hostname: hostName,
        userUUID: anonymizationEnabled && userId ? anonymize(userId) : userId,
        workspaceUUID:
          anonymizationEnabled && workspaceId
            ? anonymize(workspaceId)
            : workspaceId,
        workspaceDisplayName: workspaceDisplayName,
        workspaceDomainName: workspaceDomainName,
        ...createEventInput.data,
      },
    };

    try {
      await this.httpService.axiosRef.post('/v1', data);
    } catch {
      this.logger.error('Failed to send analytics event');

      return { success: false };
    }

    return { success: true };
  }
}
