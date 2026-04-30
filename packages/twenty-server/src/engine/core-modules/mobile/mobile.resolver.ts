import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

import { MobileService } from './mobile.service';

// --- DTOs ---
@ObjectType()
class MobileAppDTO {
  @Field() id: string;
  @Field() workspaceId: string;
  @Field() name: string;
  @Field() bundleId: string;
  @Field() platform: string;
  @Field() status: string;
  @Field({ nullable: true }) version: string;
  @Field() isProduction: boolean;
  @Field() createdAt: Date;
}

@ObjectType()
class MobileDeviceDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field() deviceToken: string;
  @Field({ nullable: true }) deviceName: string;
  @Field() platform: string;
  @Field({ nullable: true }) osVersion: string;
  @Field({ nullable: true }) appVersion: string;
  @Field() isOfflineEnabled: boolean;
  @Field({ nullable: true }) lastActiveAt: Date;
  @Field() createdAt: Date;
}

@ObjectType()
class PushNotificationResultDTO {
  @Field(() => Int) sent: number;
  @Field(() => Int) failed: number;
}

@InputType()
class RegisterAppInput {
  @Field() name: string;
  @Field() bundleId: string;
  @Field() platform: string;
  @Field({ nullable: true }) version?: string;
  @Field({ nullable: true }) isProduction?: boolean;
}

@InputType()
class RegisterDeviceInput {
  @Field() deviceToken: string;
  @Field({ nullable: true }) deviceId?: string;
  @Field({ nullable: true }) deviceName?: string;
  @Field() platform: string;
  @Field({ nullable: true }) osVersion?: string;
  @Field({ nullable: true }) appVersion?: string;
}

@InputType()
class SendPushNotificationInput {
  @Field() userId: string;
  @Field() title: string;
  @Field() body: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class MobileResolver {
  constructor(private readonly mobileService: MobileService) {}

  @Mutation(() => MobileAppDTO)
  async registerApp(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RegisterAppInput,
  ) {
    return this.mobileService.registerApp(workspace.id, input as any);
  }

  @Mutation(() => MobileDeviceDTO)
  async registerDevice(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('input') input: RegisterDeviceInput,
  ) {
    return this.mobileService.registerDevice(workspace.id, user.id, input as any);
  }

  @Mutation(() => PushNotificationResultDTO)
  async sendPushNotification(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: SendPushNotificationInput,
  ) {
    return this.mobileService.sendPushNotification(
      workspace.id,
      input.userId,
      input.title,
      input.body,
    );
  }

  @Query(() => [MobileDeviceDTO])
  async getUserDevices(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
  ) {
    return this.mobileService.getUserDevices(user.id, workspace.id);
  }

  @Query(() => [MobileAppDTO])
  async getMobileApps(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.mobileService.getApps(workspace.id);
  }
}
