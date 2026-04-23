import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
} from '@nestjs/common';

import { OfflineSyncService } from './offline-sync.service';
import { SyncOperation } from './offline-sync.entity';

class QueueChangeDto {
  objectName: string;
  objectId: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  previousData?: Record<string, unknown>;
  clientTimestamp?: string;
  idempotencyKey?: string;
}

class ResolveConflictDto {
  resolution: 'client' | 'server' | 'merge';
  mergedData?: Record<string, unknown>;
}

@Controller('offline-sync')
export class OfflineSyncController {
  constructor(private readonly syncService: OfflineSyncService) {}

  @Post('register')
  async registerClient(
    @Headers('x-workspace-id') workspaceId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    return this.syncService.registerClient(workspaceId, userId, deviceId);
  }

  @Get('changes')
  async getChanges(
    @Headers('x-workspace-id') workspaceId: string,
    @Headers('x-device-id') deviceId: string,
    @Query('since') sinceToken?: string,
    @Query('limit') limit?: number,
  ) {
    return this.syncService.getChanges(
      workspaceId,
      deviceId,
      sinceToken,
      limit || 100,
    );
  }

  @Post('changes')
  @HttpCode(200)
  async queueChanges(
    @Headers('x-workspace-id') workspaceId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-device-id') deviceId: string,
    @Body() dto: QueueChangeDto,
  ) {
    return this.syncService.queueChange(
      workspaceId,
      userId,
      deviceId,
      dto.objectName,
      dto.objectId,
      dto.operation,
      dto.data,
      dto.previousData,
      dto.clientTimestamp ? new Date(dto.clientTimestamp) : undefined,
      dto.idempotencyKey,
    );
  }

  @Post('changes/processed')
  @HttpCode(200)
  async markProcessed(
    @Headers('x-device-id') deviceId: string,
    @Body() body: { changeIds: string[] },
  ) {
    return this.syncService.markChangesProcessed(body.changeIds, deviceId);
  }

  @Put('sync-token')
  async updateSyncToken(
    @Headers('x-workspace-id') workspaceId: string,
    @Headers('x-device-id') deviceId: string,
    @Body() body: { token: string },
  ) {
    return this.syncService.updateClientSync(
      deviceId,
      workspaceId,
      body.token,
    );
  }

  @Get('client')
  async getClient(
    @Headers('x-workspace-id') workspaceId: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    return this.syncService.getClient(deviceId, workspaceId);
  }

  @Post('conflicts/:id/resolve')
  async resolveConflict(
    @Param('id') conflictId: string,
    @Body() dto: ResolveConflictDto,
  ) {
    return this.syncService.resolveConflict(
      conflictId,
      dto.resolution,
      dto.mergedData,
    );
  }

  @Post('retry')
  async retryFailed(
    @Headers('x-workspace-id') workspaceId: string,
  ) {
    const count = await this.syncService.retryFailedChanges(workspaceId);
    return { retried: count };
  }

  @Post('cleanup')
  async cleanup(
    @Headers('x-workspace-id') workspaceId: string,
    @Query('days') days?: number,
  ) {
    const count = await this.syncService.cleanupOldChanges(workspaceId, days || 30);
    return { cleaned: count };
  }
}
