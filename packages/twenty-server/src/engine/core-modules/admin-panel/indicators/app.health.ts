import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { HealthStateManager } from 'src/engine/core-modules/admin-panel/utils/health-state-manager.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AppHealthIndicator {
  private stateManager = new HealthStateManager();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  // TODO refactor, a workspace health should be based on its app versioning
  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('app');

    try {
      const totalWorkspaceCount = await this.workspaceRepository.count();

      const details = {
        system: {
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
        },
        overview: {
          totalWorkspacesCount: totalWorkspaceCount,
          erroredWorkspaceCount: 0,
        },
        erroredWorkspace: 0,
      };

      this.stateManager.updateState(details);

      return indicator.up({ details });
    } catch (error) {
      const stateWithAge = this.stateManager.getStateWithAge();

      return indicator.down({
        message: error.message,
        details: {
          system: {
            nodeVersion: process.version,
            timestamp: new Date().toISOString(),
          },
          stateHistory: stateWithAge,
        },
      });
    }
  }
}
