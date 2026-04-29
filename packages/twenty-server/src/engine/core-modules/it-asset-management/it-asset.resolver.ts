import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ITAssetService } from './it-asset.service';

// --- DTOs ---
@ObjectType()
class ITAssetDTO {
  @Field() id: string;
  @Field() status: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) assignedToId?: string;
  @Field(() => Float, { nullable: true }) purchasePrice?: number;
  @Field(() => Float, { nullable: true }) currentValue?: number;
  @Field({ nullable: true }) warrantyExpiry?: Date;
}

@ObjectType()
class LicenseUtilizationDTO {
  @Field() name: string;
  @Field(() => Int) total: number;
  @Field(() => Int) used: number;
  @Field(() => Int) waste: number;
  @Field(() => Float) annualCost: number;
}

@ObjectType()
class SaaSSpendDTO {
  @Field(() => Float) total: number;
}

@ObjectType()
class ChangeRequestDTO {
  @Field() id: string;
  @Field() status: string;
  @Field({ nullable: true }) approverId?: string;
}

@InputType()
class RegisterAssetInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) serialNumber?: string;
  @Field({ nullable: true }) category?: string;
  @Field(() => Float, { nullable: true }) purchasePrice?: number;
  @Field({ nullable: true }) purchaseDate?: Date;
  @Field(() => Int, { nullable: true }) usefulLifeMonths?: number;
  @Field({ nullable: true }) depreciationMethod?: string;
  @Field({ nullable: true }) warrantyExpiry?: Date;
}

@InputType()
class CreateChangeRequestInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) priority?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ITAssetResolver {
  constructor(private readonly service: ITAssetService) {}

  @Mutation(() => ITAssetDTO)
  async registerAsset(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RegisterAssetInput,
  ) {
    return this.service.registerAsset(workspace.id, input as any);
  }

  @Mutation(() => ITAssetDTO)
  async assignAsset(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('assetId') assetId: string,
    @Args('userId') userId: string,
  ) {
    return this.service.assignAsset(assetId, userId);
  }

  @Query(() => Float)
  async calculateDepreciation(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('assetId') assetId: string,
  ) {
    return this.service.calculateDepreciation(assetId);
  }

  @Query(() => [ITAssetDTO])
  async getExpiringWarranties(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('withinDays', { type: () => Int, defaultValue: 30 }) withinDays: number,
  ) {
    return this.service.getExpiringWarranties(workspace.id, withinDays);
  }

  @Query(() => [LicenseUtilizationDTO])
  async getLicenseUtilization(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getLicenseUtilization(workspace.id);
  }

  @Query(() => SaaSSpendDTO)
  async getSaaSSpend(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getSaaSSpend(workspace.id);
  }

  @Mutation(() => ChangeRequestDTO)
  async createChangeRequest(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateChangeRequestInput,
  ) {
    return this.service.createChangeRequest(workspace.id, input);
  }
}
