import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Int, Float } from '@nestjs/graphql';
import { Field, ObjectType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { SecurityService } from './security.service';

// --- DTOs ---

@ObjectType()
class DeviceSessionDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field() status: string;
  @Field({ nullable: true }) deviceName: string;
  @Field({ nullable: true }) ipAddress: string;
  @Field({ nullable: true }) currentLoginAt: Date;
  @Field({ nullable: true }) lastActiveAt: Date;
}

@ObjectType()
class SecurityDashboardDTO {
  @Field(() => Int) activeSessions: number;
  @Field(() => Int) revokedSessions: number;
  @Field(() => [DeviceSessionDTO]) recentLoginAttempts: DeviceSessionDTO[];
  @Field(() => Int) twoFactorAdoptionRate: number;
}

// --- Resolver ---

@MetadataResolver(() => 'Security')
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SecurityResolver {
  constructor(private readonly securityService: SecurityService) {}

  @Query(() => SecurityDashboardDTO)
  async getSecurityDashboard(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SecurityDashboardDTO> {
    const dashboard = await this.securityService.getSecurityDashboard(
      workspace.id,
    );

    return {
      activeSessions: dashboard.activeSessions,
      revokedSessions: dashboard.revokedSessions,
      recentLoginAttempts: dashboard.recentLoginAttempts.map((d) => ({
        id: d.id,
        userId: d.userId,
        status: d.status,
        deviceName: d.deviceName,
        ipAddress: d.ipAddress,
        currentLoginAt: d.currentLoginAt,
        lastActiveAt: d.lastActiveAt,
      })),
      twoFactorAdoptionRate: dashboard.twoFactorAdoptionRate,
    };
  }

  @Query(() => String)
  async exportAuditLog(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('format', { defaultValue: 'json' }) format: string,
  ): Promise<string> {
    return this.securityService.exportAuditLog(
      workspace.id,
      new Date(startDate),
      new Date(endDate),
      format as 'csv' | 'json',
    );
  }

  @Query(() => [DeviceSessionDTO])
  async getDeviceSessions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('userId') userId: string,
  ): Promise<DeviceSessionDTO[]> {
    const devices = await this.securityService.findUserDevices(
      userId,
      workspace.id,
    );

    return devices.map((d) => ({
      id: d.id,
      userId: d.userId,
      status: d.status,
      deviceName: d.deviceName,
      ipAddress: d.ipAddress,
      currentLoginAt: d.currentLoginAt,
      lastActiveAt: d.lastActiveAt,
    }));
  }

  @Mutation(() => Boolean)
  async revokeSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('deviceId') deviceId: string,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    await this.securityService.revokeDevice(
      deviceId,
      userId,
      workspace.id,
    );

    return true;
  }
}
