import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { OfflineSyncService } from './offline-sync.service';

// --- DTOs ---

@ObjectType()
class OfflineChangeDTO {
  @Field() id: string;
  @Field() objectName: string;
  @Field() objectId: string;
  @Field() operation: string;
  @Field() status: string;
  @Field({ nullable: true }) deviceId: string;
  @Field({ nullable: true }) errorMessage: string;
}

@ObjectType()
class OfflineConflictDTO {
  @Field() id: string;
  @Field() changeId: string;
  @Field({ nullable: true }) resolution: string;
  @Field({ nullable: true }) resolvedAt: Date;
}

@ObjectType()
class OfflineClientDTO {
  @Field() deviceId: string;
  @Field({ nullable: true }) lastSyncToken: string;
  @Field({ nullable: true }) lastSyncAt: Date;
  @Field(() => Int) pendingChanges: number;
}

@InputType()
class SubmitChangeInput {
  @Field() deviceId: string;
  @Field() objectName: string;
  @Field() objectId: string;
  @Field() operation: string;
  @Field() data: string; // JSON string
  @Field({ nullable: true }) previousData: string;
  @Field({ nullable: true }) idempotencyKey: string;
}

@InputType()
class ResolveConflictInput {
  @Field() conflictId: string;
  @Field() resolution: string; // 'client' | 'server' | 'merge'
  @Field({ nullable: true }) mergedData: string; // JSON string
}

// --- Resolver ---

@MetadataResolver(() => 'OfflineSync')
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class OfflineSyncResolver {
  constructor(private readonly offlineSyncService: OfflineSyncService) {}

  @Mutation(() => OfflineChangeDTO)
  async submitChange(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: SubmitChangeInput,
  ): Promise<OfflineChangeDTO> {
    const data = JSON.parse(input.data);
    const previousData = input.previousData
      ? JSON.parse(input.previousData)
      : undefined;

    const change = await this.offlineSyncService.queueChange(
      workspace.id,
      '', // userId from context
      input.deviceId,
      input.objectName,
      input.objectId,
      input.operation as any,
      data,
      previousData,
      undefined,
      input.idempotencyKey,
    );

    return {
      id: change.id,
      objectName: change.objectName,
      objectId: change.objectId,
      operation: change.operation,
      status: change.status,
      deviceId: change.deviceId,
      errorMessage: change.errorMessage,
    };
  }

  @Query(() => [OfflineConflictDTO])
  async getConflicts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('deviceId') deviceId: string,
  ): Promise<OfflineConflictDTO[]> {
    const result = await this.offlineSyncService.getChanges(
      workspace.id,
      deviceId,
    );

    return result.changes
      .filter((c) => c.status === 'conflict')
      .map((c) => ({
        id: c.id,
        changeId: c.id,
        resolution: null as unknown as string,
        resolvedAt: null as unknown as Date,
      }));
  }

  @Mutation(() => OfflineChangeDTO)
  async resolveConflict(
    @Args('input') input: ResolveConflictInput,
  ): Promise<OfflineChangeDTO> {
    const mergedData = input.mergedData
      ? JSON.parse(input.mergedData)
      : undefined;

    const change = await this.offlineSyncService.resolveConflict(
      input.conflictId,
      input.resolution as 'client' | 'server' | 'merge',
      mergedData,
    );

    return {
      id: change.id,
      objectName: change.objectName,
      objectId: change.objectId,
      operation: change.operation,
      status: change.status,
      deviceId: change.deviceId,
      errorMessage: change.errorMessage,
    };
  }

  @Mutation(() => Int)
  async retryFailedChanges(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('maxRetries', { type: () => Int, nullable: true })
    maxRetries: number,
  ): Promise<number> {
    return this.offlineSyncService.retryFailedChanges(
      workspace.id,
      maxRetries ?? 3,
    );
  }

  @Query(() => [OfflineClientDTO])
  async getClientDevices(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('deviceId', { nullable: true }) deviceId: string,
  ): Promise<OfflineClientDTO[]> {
    if (deviceId) {
      const client = await this.offlineSyncService.getClient(
        deviceId,
        workspace.id,
      );

      if (!client) return [];

      return [
        {
          deviceId: client.deviceId,
          lastSyncToken: client.lastSyncToken,
          lastSyncAt: client.lastSyncAt,
          pendingChanges: client.pendingChanges ?? 0,
        },
      ];
    }

    return [];
  }
}
