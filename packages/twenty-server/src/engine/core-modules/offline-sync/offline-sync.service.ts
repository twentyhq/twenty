import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import {
  OfflineChangeEntity,
  OfflineConflictEntity,
  OfflineClientEntity,
  SyncOperation,
  SyncStatus,
} from './offline-sync.entity';

@Injectable()
export class OfflineSyncService {
  constructor(
    @InjectRepository(OfflineChangeEntity)
    private readonly changeRepo: Repository<OfflineChangeEntity>,
    @InjectRepository(OfflineConflictEntity)
    private readonly conflictRepo: Repository<OfflineConflictEntity>,
    @InjectRepository(OfflineClientEntity)
    private readonly clientRepo: Repository<OfflineClientEntity>,
  ) {}

  async queueChange(
    workspaceId: string,
    userId: string,
    deviceId: string,
    objectName: string,
    objectId: string,
    operation: SyncOperation,
    data: Record<string, unknown>,
    previousData?: Record<string, unknown>,
    clientTimestamp?: Date,
    idempotencyKey?: string,
  ): Promise<OfflineChangeEntity> {
    const existing = idempotencyKey
      ? await this.changeRepo.findOne({ where: { idempotencyKey } })
      : null;

    if (existing) {
      return existing;
    }

    const change = this.changeRepo.create({
      workspaceId,
      userId,
      deviceId,
      objectName,
      objectId,
      operation,
      data,
      previousData,
      clientTimestamp,
      idempotencyKey,
      status: SyncStatus.PENDING,
    });

    await this.clientRepo.increment({ deviceId, workspaceId }, 'pendingChanges', 1);

    return this.changeRepo.save(change);
  }

  async getChanges(
    workspaceId: string,
    deviceId: string,
    sinceToken?: string,
    limit = 100,
  ): Promise<{ changes: OfflineChangeEntity[]; token: string }> {
    const query = this.changeRepo
      .createQueryBuilder('change')
      .where('change.workspaceId = :workspaceId', { workspaceId })
      .andWhere('change.deviceId != :deviceId', { deviceId })
      .andWhere('change.status = :status', { status: SyncStatus.PENDING })
      .orderBy('change.createdAt', 'ASC')
      .take(limit);

    if (sinceToken) {
      const sinceDate = new Date(sinceToken);
      query.andWhere('change.createdAt > :since', { since: sinceDate });
    }

    const changes = await query.getMany();
    const token = changes.length > 0
      ? changes[changes.length - 1].createdAt.toISOString()
      : sinceToken || new Date().toISOString();

    return { changes, token };
  }

  async markChangesProcessed(
    changeIds: string[],
    deviceId: string,
  ): Promise<void> {
    await this.changeRepo.update(changeIds, {
      status: SyncStatus.COMPLETED,
      processedAt: new Date(),
    });

    await this.clientRepo.decrement(
      { deviceId, workspaceId: '' },
      'pendingChanges',
      changeIds.length,
    );
  }

  async registerClient(
    workspaceId: string,
    userId: string,
    deviceId: string,
  ): Promise<OfflineClientEntity> {
    let client = await this.clientRepo.findOne({
      where: { deviceId, workspaceId },
    });

    if (!client) {
      client = this.clientRepo.create({
        workspaceId,
        userId,
        deviceId,
        lastSyncAt: new Date(),
      });
    } else {
      client.lastOfflineAt = new Date();
    }

    return this.clientRepo.save(client);
  }

  async getClient(deviceId: string, workspaceId: string): Promise<OfflineClientEntity | null> {
    return this.clientRepo.findOne({ where: { deviceId, workspaceId } });
  }

  async updateClientSync(
    deviceId: string,
    workspaceId: string,
    token: string,
  ): Promise<OfflineClientEntity> {
    await this.clientRepo.update(
      { deviceId, workspaceId },
      { lastSyncToken: token, lastSyncAt: new Date() },
    );

    const client = await this.clientRepo.findOne({
      where: { deviceId, workspaceId },
    });

    if (!client) {
      throw new NotFoundException(`Client ${deviceId} not found`);
    }

    return client;
  }

  async detectConflict(
    changeId: string,
    serverData: Record<string, unknown>,
  ): Promise<OfflineConflictEntity> {
    const change = await this.changeRepo.findOne({
      where: { id: changeId },
    });

    if (!change) {
      throw new NotFoundException(`Change ${changeId} not found`);
    }

    const conflict = this.conflictRepo.create({
      workspaceId: change.workspaceId,
      changeId,
      serverData,
      clientData: change.data,
    });

    await this.changeRepo.update(changeId, { status: SyncStatus.CONFLICT });

    return this.conflictRepo.save(conflict);
  }

  async resolveConflict(
    conflictId: string,
    resolution: 'client' | 'server' | 'merge',
    mergedData?: Record<string, unknown>,
  ): Promise<OfflineChangeEntity> {
    const conflict = await this.conflictRepo.findOne({
      where: { id: conflictId },
      relations: ['change'],
    });

    if (!conflict) {
      throw new NotFoundException(`Conflict ${conflictId} not found`);
    }

    let finalData: Record<string, unknown>;

    if (resolution === 'merge' && mergedData) {
      finalData = mergedData;
    } else if (resolution === 'client') {
      finalData = conflict.clientData;
    } else {
      finalData = conflict.serverData;
    }

    await this.conflictRepo.update(conflictId, {
      resolution,
      resolvedAt: new Date(),
    });

    await this.changeRepo.update(conflict.changeId, {
      data: finalData,
      status: SyncStatus.PENDING,
    });

    return this.changeRepo.findOneBy({ id: conflict.changeId });
  }

  async retryFailedChanges(workspaceId: string, maxRetries = 3): Promise<number> {
    const result = await this.changeRepo.update(
      {
        workspaceId,
        status: SyncStatus.FAILED,
        retryCount: LessThan(maxRetries),
      },
      {
        status: SyncStatus.PENDING,
        errorMessage: null,
      },
    );

    return result.affected || 0;
  }

  async cleanupOldChanges(workspaceId: string, daysOld = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.changeRepo.delete({
      workspaceId,
      status: SyncStatus.COMPLETED,
      createdAt: LessThan(cutoff),
    });

    return result.affected || 0;
  }
}
