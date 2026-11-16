import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { AdminPanelBillingArrangementService } from 'src/engine/core-modules/admin-panel/services/admin-panel-billing-arrangement.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
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
}
