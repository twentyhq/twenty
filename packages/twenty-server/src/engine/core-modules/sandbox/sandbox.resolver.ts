import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Int, Float } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { SandboxService } from './sandbox.service';

// --- DTOs ---

@ObjectType()
class SandboxDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() status: string;
  @Field({ nullable: true }) databaseSchema: string | null;
  @Field({ nullable: true }) description: string | null;
  @Field() autoRefresh: boolean;
  @Field(() => Int, { nullable: true }) autoRefreshIntervalHours: number;
  @Field({ nullable: true }) expiresAt: Date | null;
  @Field({ nullable: true }) lastRefreshedAt: Date | null;
  @Field() createdAt: Date;
}

@ObjectType()
class SandboxSummaryDTO {
  @Field(() => Int) total: number;
  @Field(() => Int) active: number;
  @Field(() => Int) creating: number;
  @Field(() => Int) paused: number;
  @Field(() => Int) failed: number;
  @Field(() => Int) autoRefreshEnabled: number;
  @Field(() => Int) expiringSoon: number;
}

@InputType()
class CreateSandboxInput {
  @Field() name: string;
  @Field({ nullable: true }) description: string;
  @Field({ nullable: true }) sourceWorkspaceId: string;
  @Field({ defaultValue: false }) includeData: boolean;
  @Field(() => Int, { defaultValue: 10 }) dataSamplePercent: number;
}

// --- Resolver ---

@MetadataResolver(() => 'Sandbox')
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SandboxResolver {
  constructor(private readonly sandboxService: SandboxService) {}

  @Query(() => [SandboxDTO])
  async sandboxes(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SandboxDTO[]> {
    const items = await this.sandboxService.findByWorkspace(workspace.id);

    return items.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      databaseSchema: s.databaseSchema,
      description: s.description,
      autoRefresh: s.autoRefresh,
      autoRefreshIntervalHours: s.autoRefreshIntervalHours,
      expiresAt: s.expiresAt,
      lastRefreshedAt: s.lastRefreshedAt,
      createdAt: s.createdAt,
    }));
  }

  @Query(() => SandboxSummaryDTO)
  async sandboxSummary(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SandboxSummaryDTO> {
    return this.sandboxService.getSummary(workspace.id);
  }

  @Mutation(() => SandboxDTO)
  async createSandbox(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateSandboxInput,
  ): Promise<SandboxDTO> {
    const s = await this.sandboxService.createSandbox(workspace.id, {
      name: input.name,
      description: input.description,
      sourceWorkspaceId: input.sourceWorkspaceId,
      includeData: input.includeData,
      dataSamplePercent: input.dataSamplePercent,
    } as any);

    return {
      id: s.id,
      name: s.name,
      status: s.status,
      databaseSchema: s.databaseSchema,
      description: s.description,
      autoRefresh: s.autoRefresh,
      autoRefreshIntervalHours: s.autoRefreshIntervalHours,
      expiresAt: s.expiresAt,
      lastRefreshedAt: s.lastRefreshedAt,
      createdAt: s.createdAt,
    };
  }

  @Mutation(() => SandboxDTO)
  async pauseSandbox(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id') id: string,
  ): Promise<SandboxDTO> {
    const s = await this.sandboxService.pauseSandbox(id, workspace.id);

    return {
      id: s.id,
      name: s.name,
      status: s.status,
      databaseSchema: s.databaseSchema,
      description: s.description,
      autoRefresh: s.autoRefresh,
      autoRefreshIntervalHours: s.autoRefreshIntervalHours,
      expiresAt: s.expiresAt,
      lastRefreshedAt: s.lastRefreshedAt,
      createdAt: s.createdAt,
    };
  }

  @Mutation(() => SandboxDTO)
  async resumeSandbox(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id') id: string,
  ): Promise<SandboxDTO> {
    const s = await this.sandboxService.resumeSandbox(id, workspace.id);

    return {
      id: s.id,
      name: s.name,
      status: s.status,
      databaseSchema: s.databaseSchema,
      description: s.description,
      autoRefresh: s.autoRefresh,
      autoRefreshIntervalHours: s.autoRefreshIntervalHours,
      expiresAt: s.expiresAt,
      lastRefreshedAt: s.lastRefreshedAt,
      createdAt: s.createdAt,
    };
  }

  @Mutation(() => Boolean)
  async deleteSandbox(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.sandboxService.deleteSandbox(id, workspace.id);

    return true;
  }

  @Mutation(() => SandboxDTO)
  async refreshSandbox(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id') id: string,
  ): Promise<SandboxDTO> {
    const s = await this.sandboxService.refreshSandbox(id, workspace.id);

    return {
      id: s.id,
      name: s.name,
      status: s.status,
      databaseSchema: s.databaseSchema,
      description: s.description,
      autoRefresh: s.autoRefresh,
      autoRefreshIntervalHours: s.autoRefreshIntervalHours,
      expiresAt: s.expiresAt,
      lastRefreshedAt: s.lastRefreshedAt,
      createdAt: s.createdAt,
    };
  }
}
