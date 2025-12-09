import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ImpersonateInput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.input';
import { ImpersonateOutput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.output';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { ImpersonatePermissionGuard } from 'src/engine/guards/impersonate-permission.guard';
import { NoImpersonationGuard } from 'src/engine/guards/no-impersonation.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UsePipes(ResolverValidationPipe)
export class ImpersonationResolver {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @UseGuards(
    WorkspaceAuthGuard,
    UserAuthGuard,
    NoImpersonationGuard,
    ImpersonatePermissionGuard,
    CustomPermissionGuard,
  )
  @Mutation(() => ImpersonateOutput)
  async impersonate(
    @Args() { workspaceId, userId: toImpersonateUserId }: ImpersonateInput,
    @AuthUserWorkspaceId() impersonatorUserWorkspaceId: string,
  ): Promise<ImpersonateOutput> {
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
}
