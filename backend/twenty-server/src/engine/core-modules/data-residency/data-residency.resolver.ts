import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { DataResidencyService } from './data-residency.service';

// --- DTOs ---
@ObjectType()
class DataResidencyConfigDTO {
  @Field() id: string;
  @Field() workspaceId: string;
  @Field() currentRegion: string;
  @Field({ nullable: true }) requestedRegion: string;
  @Field() status: string;
  @Field() enforceRegion: boolean;
  @Field(() => [String], { nullable: true }) allowedRegions: string[];
  @Field({ nullable: true }) migrationStartedAt: Date;
  @Field({ nullable: true }) migrationCompletedAt: Date;
  @Field({ nullable: true }) migrationError: string;
}

@ObjectType()
class RegionInfoDTO {
  @Field() region: string;
  @Field() host: string;
  @Field() name: string;
}

@InputType()
class SetAllowedRegionsInput {
  @Field(() => [String]) regions: string[];
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class DataResidencyResolver {
  constructor(private readonly drService: DataResidencyService) {}

  @Query(() => DataResidencyConfigDTO)
  async dataResidencyConfig(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.drService.getWorkspaceConfig(workspace.id);
  }

  @Mutation(() => DataResidencyConfigDTO)
  async initializeDataResidency(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('region', { nullable: true }) region?: string,
  ) {
    return this.drService.initializeWorkspace(workspace.id, region as any);
  }

  @Mutation(() => DataResidencyConfigDTO)
  async requestRegionMigration(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('newRegion') newRegion: string,
  ) {
    return this.drService.requestMigration(workspace.id, newRegion as any);
  }

  @Mutation(() => DataResidencyConfigDTO)
  async cancelRegionMigration(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.drService.cancelMigration(workspace.id);
  }

  @Mutation(() => DataResidencyConfigDTO)
  async setAllowedRegions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: SetAllowedRegionsInput,
  ) {
    return this.drService.setAllowedRegions(workspace.id, input.regions as any);
  }

  @Mutation(() => DataResidencyConfigDTO)
  async enforceRegion(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('enforce') enforce: boolean,
  ) {
    return this.drService.enforceRegion(workspace.id, enforce);
  }

  @Query(() => RegionInfoDTO)
  async regionInfo(@Args('region') region: string) {
    return {
      region,
      host: this.drService.getRegionHost(region as any),
      name: this.drService.getRegionName(region as any),
    };
  }
}
