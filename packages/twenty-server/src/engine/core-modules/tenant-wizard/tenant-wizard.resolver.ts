import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { TenantWizardService } from './tenant-wizard.service';

@ObjectType()
class WizardStepDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) order: number;
  @Field() status: string;
  @Field() isRequired: boolean;
  @Field({ nullable: true }) componentKey?: string;
  @Field(() => Int, { nullable: true }) estimatedMinutes?: number;
}

@ObjectType()
class WizardProgressDTO {
  @Field({ nullable: true }) id?: string;
  @Field(() => Int) currentStepOrder: number;
  @Field(() => Int) totalSteps: number;
  @Field(() => Int) completedSteps: number;
  @Field(() => Float) progressPercent: number;
  @Field() isCompleted: boolean;
}

@ObjectType()
class IndustryTemplateDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field() industry: string;
  @Field(() => [String], { nullable: true }) modules?: string[];
  @Field(() => Int) usageCount: number;
}

@ObjectType()
class ValidationResultDTO {
  @Field() isValid: boolean;
  @Field(() => [String]) errors: string[];
  @Field(() => [String]) warnings: string[];
}

@ObjectType()
class DemoDataResultDTO {
  @Field() generated: boolean;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class TenantWizardResolver {
  constructor(private readonly service: TenantWizardService) {}

  @Query(() => [WizardStepDTO])
  async getWizardSteps(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getWizardSteps(workspace.id);
  }

  @Mutation(() => WizardProgressDTO)
  async completeWizardStep(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('stepId') stepId: string,
  ) {
    return this.service.completeStep(workspace.id, user.id, stepId);
  }

  @Mutation(() => IndustryTemplateDTO)
  async selectIndustryTemplate(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('templateId') templateId: string,
  ) {
    return this.service.selectTemplate(workspace.id, user.id, templateId);
  }

  @Query(() => WizardProgressDTO, { nullable: true })
  async getWizardProgress(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
  ) {
    const result = await this.service.getProgress(workspace.id, user.id);
    return result.progress;
  }

  @Mutation(() => DemoDataResultDTO)
  async generateDemoData(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.generateDemoData(workspace.id);
  }

  @Query(() => ValidationResultDTO)
  async validateWizardConfiguration(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.validateConfiguration(workspace.id);
  }
}
