import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

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
  ) {
    if (!this.environmentService.isTelemetryEnabled()) {
      return { success: true };
    }

    const anonymizationEnabled =
      this.environmentService.isTelemetryAnonymizationEnabled();

    const data = {
      type: createEventInput.type,
      data: {
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
        workspaceDomain: workspace ? workspace.domainName : undefined,
        ...createEventInput.data,
      },
    };

    try {
      await this.httpService.post('/event?noToken', data);
    } catch {}

    return { success: true };
  }
}
