import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MobileNativeService } from './mobile-native.service';

@ObjectType()
class MobileSessionDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field({ nullable: true }) platform?: string;
  @Field({ nullable: true }) appVersion?: string;
  @Field() isActive: boolean;
  @Field(() => Int) sessionCount: number;
  @Field(() => Int) offlineSyncsPending: number;
}

@ObjectType()
class BiometricValidationDTO {
  @Field() valid: boolean;
  @Field() locked: boolean;
  @Field(() => Int) remainingAttempts: number;
}

@ObjectType()
class OfflineQueueDTO {
  @Field() id: string;
  @Field() actionType: string;
  @Field() entityName: string;
  @Field() syncStatus: string;
  @Field(() => Int) retryCount: number;
}

@ObjectType()
class SyncResultDTO {
  @Field(() => Int) synced: number;
  @Field(() => Int) failed: number;
  @Field(() => Int) conflicts: number;
  @Field(() => Int) remaining: number;
}

@ObjectType()
class LocationCheckinDTO {
  @Field() id: string;
  @Field() checkinType: string;
  @Field(() => Float) latitude: number;
  @Field(() => Float) longitude: number;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) accountId?: string;
}

@ObjectType()
class NearbyClientDTO {
  @Field() checkinId: string;
  @Field() accountId: string;
  @Field(() => Float) distanceKm: number;
}

@InputType()
class CreateMobileSessionInput {
  @Field() userId: string;
  @Field({ nullable: true }) platform?: string;
  @Field({ nullable: true }) appVersion?: string;
  @Field({ nullable: true }) osVersion?: string;
  @Field({ nullable: true }) deviceModel?: string;
  @Field({ nullable: true }) deviceId?: string;
  @Field({ nullable: true }) pushToken?: string;
}

@InputType()
class QueueOfflineActionInput {
  @Field() userId: string;
  @Field({ nullable: true }) actionType?: string;
  @Field() entityName: string;
  @Field({ nullable: true }) entityId?: string;
}

@InputType()
class RecordCheckinInput {
  @Field() userId: string;
  @Field({ nullable: true }) checkinType?: string;
  @Field(() => Float) latitude: number;
  @Field(() => Float) longitude: number;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) accountId?: string;
  @Field({ nullable: true }) notes?: string;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class MobileNativeResolver {
  constructor(private readonly service: MobileNativeService) {}

  @Mutation(() => MobileSessionDTO)
  async createMobileSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateMobileSessionInput,
  ) {
    return this.service.createSession(workspace.id, input as unknown as Parameters<MobileNativeService['createSession']>[1]);
  }

  @Query(() => BiometricValidationDTO)
  async validateBiometric(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('userId') userId: string,
    @Args('deviceId') deviceId: string,
  ) {
    return this.service.validateBiometric(workspace.id, userId, deviceId);
  }

  @Mutation(() => OfflineQueueDTO)
  async queueOfflineAction(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: QueueOfflineActionInput,
  ) {
    return this.service.queueOfflineAction(workspace.id, input as unknown as Parameters<MobileNativeService['queueOfflineAction']>[1]);
  }

  @Mutation(() => SyncResultDTO)
  async syncOfflineQueue(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('userId') userId: string,
  ) {
    return this.service.syncOfflineQueue(workspace.id, userId);
  }

  @Mutation(() => LocationCheckinDTO)
  async recordLocationCheckin(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RecordCheckinInput,
  ) {
    return this.service.recordCheckin(workspace.id, input as unknown as Parameters<MobileNativeService['recordCheckin']>[1]);
  }

  @Query(() => [NearbyClientDTO])
  async getNearbyClients(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('radiusKm', { type: () => Float, nullable: true }) radiusKm?: number,
  ) {
    return this.service.getNearbyClients(workspace.id, latitude, longitude, radiusKm ?? 10);
  }
}
