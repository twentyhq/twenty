import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SaaSPlatformService } from './saas-platform.service';

// --- DTOs ---
@ObjectType()
class TenantConfigDTO {
  @Field() id: string;
  @Field({ nullable: true }) companyName?: string;
  @Field({ nullable: true }) country?: string;
  @Field({ nullable: true }) plan?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) currency?: string;
  @Field({ nullable: true }) trialEndsAt?: Date;
}

@ObjectType()
class TenantModuleDTO {
  @Field() id: string;
  @Field() moduleCode: string;
  @Field() isActive: boolean;
  @Field({ nullable: true }) billingType?: string;
  @Field(() => Float, { nullable: true }) priceUSD?: number;
}

@ObjectType()
class InvoiceLineItemDTO {
  @Field() module: string;
  @Field() type: string;
  @Field(() => Int) quantity: number;
  @Field(() => Float) unitPrice: number;
  @Field(() => Float) total: number;
}

@ObjectType()
class MonthlyInvoiceDTO {
  @Field(() => Float) subtotalUSD: number;
  @Field(() => Float) taxRate: number;
  @Field(() => Float) taxAmount: number;
  @Field(() => Float) totalLocal: number;
  @Field() currency: string;
  @Field(() => [InvoiceLineItemDTO]) lineItems: InvoiceLineItemDTO[];
}

@ObjectType()
class ModuleAdoptionDTO {
  @Field() module: string;
  @Field(() => Int) tenants: number;
}

@ObjectType()
class AdminDashboardDTO {
  @Field(() => Int) totalTenants: number;
  @Field(() => Int) activeTenants: number;
  @Field(() => Int) trialTenants: number;
  @Field(() => Float) totalMRR: number;
  @Field(() => [ModuleAdoptionDTO]) moduleAdoption: ModuleAdoptionDTO[];
}

@InputType()
class ProvisionTenantInput {
  @Field() companyName: string;
  @Field() country: string;
  @Field({ nullable: true }) plan?: string;
  @Field({ nullable: true }) taxId?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SaaSPlatformResolver {
  constructor(private readonly service: SaaSPlatformService) {}

  @Mutation(() => TenantConfigDTO)
  async provisionTenant(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ProvisionTenantInput,
  ) {
    return this.service.provisionTenant(workspace.id, {
      companyName: input.companyName,
      country: input.country as any,
      plan: input.plan as any,
      taxId: input.taxId,
    });
  }

  @Mutation(() => TenantConfigDTO)
  async updatePlan(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('newPlan') newPlan: string,
  ) {
    return this.service.updatePlan(workspace.id, newPlan as any);
  }

  @Mutation(() => TenantModuleDTO)
  async activateModule(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('moduleCode') moduleCode: string,
  ) {
    return this.service.activateModule(workspace.id, moduleCode);
  }

  @Mutation(() => TenantModuleDTO)
  async deactivateModule(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('moduleCode') moduleCode: string,
  ) {
    return this.service.deactivateModule(workspace.id, moduleCode);
  }

  @Query(() => [TenantModuleDTO])
  async getActiveModules(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getActiveModules(workspace.id);
  }

  @Query(() => MonthlyInvoiceDTO)
  async calculateMonthlyInvoice(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.calculateMonthlyInvoice(workspace.id);
  }

  @Query(() => AdminDashboardDTO)
  async getAdminDashboard(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getAdminDashboard();
  }

  @Mutation(() => Int)
  async seedModuleCatalog(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.seedModuleCatalog();
  }
}
