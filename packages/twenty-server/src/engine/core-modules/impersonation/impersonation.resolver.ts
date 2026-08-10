import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { type Request } from 'express';

import { ImpersonateInput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.input';
import { ImpersonateDTO } from 'src/engine/core-modules/admin-panel/dtos/impersonate.dto';
import { StopImpersonationDTO } from 'src/engine/core-modules/admin-panel/dtos/stop-impersonation.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { AuthImpersonationContext } from 'src/engine/decorators/auth/auth-impersonation-context.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { ImpersonatePermissionGuard } from 'src/engine/guards/impersonate-permission.guard';
import { NoImpersonationGuard } from 'src/engine/guards/no-impersonation.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class ImpersonationResolver {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @UseGuards(
    WorkspaceAuthGuard,
    UserAuthGuard,
    NoImpersonationGuard,
    ImpersonatePermissionGuard,
    CustomPermissionGuard,
  )
  @Mutation(() => ImpersonateDTO)
  async impersonate(
    @Args() { workspaceId, userId: toImpersonateUserId }: ImpersonateInput,
    @AuthUserWorkspaceId() impersonatorUserWorkspaceId: string,
  ): Promise<ImpersonateDTO> {
    if (!impersonatorUserWorkspaceId) {
      throw new AuthException(
        'Impersonator user not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    return await this.impersonationService.impersonate(
      toImpersonateUserId,
      workspaceId,
      impersonatorUserWorkspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
  @Mutation(() => StopImpersonationDTO)
  async stopImpersonation(
    @AuthImpersonationContext()
    impersonationContext: AuthContext['impersonationContext'],
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: { req: Request },
  ): Promise<StopImpersonationDTO> {
    return await this.impersonationService.stopImpersonation({
      impersonationContext,
      workspaceId: workspace.id,
      request: context.req,
    });
  }
}
