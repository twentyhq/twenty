import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { EventLogQueryInput, EventLogQueryResult, EventLogTable } from './dtos';
import { EventLogsService } from './event-logs.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.SECURITY))
export class EventLogsResolver {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Query(() => EventLogQueryResult, {
    description: 'Query event logs from ClickHouse',
  })
  async queryEventLogs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: EventLogQueryInput,
  ): Promise<EventLogQueryResult> {
    return this.eventLogsService.queryEventLogs(workspace.id, input);
  }

  @Query(() => [EventLogTable], {
    description: 'Get available event log tables',
  })
  async getEventLogTables(): Promise<EventLogTable[]> {
    return this.eventLogsService.getAvailableTables();
  }
}
