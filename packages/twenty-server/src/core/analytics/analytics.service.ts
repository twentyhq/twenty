import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Request } from 'express';

import { anonymize } from 'src/utils/anonymize';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';

import { CreateAnalyticsInput } from './dto/create-analytics.input';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createEventInput: CreateAnalyticsInput,
    user: User | undefined,
    workspace: Workspace | undefined,
    request: Request,
  ) {
    if (!this.environmentService.isTelemetryEnabled()) {
      return { success: true };
    }

    const anonymizationEnabled =
      this.environmentService.isTelemetryAnonymizationEnabled();

    const data = {
      type: createEventInput.type,
      data: {
        hostname: request.hostname,
        userUUID: user
          ? anonymizationEnabled
            ? anonymize(user.id)
            : user.id
          : undefined,
        workspaceUUID: workspace
          ? anonymizationEnabled
            ? anonymize(workspace.id)
            : workspace.id
          : undefined,
        workspaceDisplayName: workspace ? workspace.displayName : undefined,
        workspaceDomainName: workspace ? workspace.domainName : undefined,
        ...createEventInput.data,
      },
    };

    try {
      await this.httpService.axiosRef.post('/v1', data);
    } catch {}

    return { success: true };
  }
}
