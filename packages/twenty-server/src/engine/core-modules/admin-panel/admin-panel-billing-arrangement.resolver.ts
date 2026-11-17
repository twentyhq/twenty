import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { CreateWorkspaceBillingArrangementInput } from 'src/engine/core-modules/admin-panel/dtos/create-workspace-billing-arrangement.input';
import { EndWorkspaceBillingArrangementInput } from 'src/engine/core-modules/admin-panel/dtos/end-workspace-billing-arrangement.input';
import { AdminPanelBillingArrangementService } from 'src/engine/core-modules/admin-panel/services/admin-panel-billing-arrangement.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const ADMIN_PANEL_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [],
};

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class AdminPanelBillingArrangementResolver {
  constructor(
    private readonly adminPanelBillingArrangementService: AdminPanelBillingArrangementService,
  ) {}

  @UseGuards(
    AccessPolicyGuard(ADMIN_PANEL_ACCESS_POLICY),
    ServerLevelImpersonateGuard,
  )
  @Query(() => [AdminPanelWorkspaceBillingArrangementDTO])
  async workspaceBillingArrangements(
    @Args('workspaceId', { type: () => UUIDScalarType }) workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO[]> {
    return this.adminPanelBillingArrangementService.findWorkspaceBillingArrangements(
      workspaceId,
    );
  }

  @UseGuards(AccessPolicyGuard(ADMIN_PANEL_ACCESS_POLICY), AdminPanelGuard)
  @Mutation(() => AdminPanelWorkspaceBillingArrangementDTO)
  async createWorkspaceBillingArrangement(
    @Args() input: CreateWorkspaceBillingArrangementInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO> {
    return this.adminPanelBillingArrangementService.createWorkspaceBillingArrangement(
      { input, grantedByUserId: actor.id },
    );
  }

  @UseGuards(AccessPolicyGuard(ADMIN_PANEL_ACCESS_POLICY), AdminPanelGuard)
  @Mutation(() => AdminPanelWorkspaceBillingArrangementDTO)
  async endWorkspaceBillingArrangement(
    @Args() {
      workspaceId,
      billingArrangementId,
    }: EndWorkspaceBillingArrangementInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO> {
    return this.adminPanelBillingArrangementService.endWorkspaceBillingArrangement(
      { workspaceId, billingArrangementId, revokedByUserId: actor.id },
    );
  }
}
