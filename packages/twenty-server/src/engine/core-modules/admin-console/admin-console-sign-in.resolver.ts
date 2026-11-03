import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { type Request } from 'express';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { SignInToAdminConsoleInput } from 'src/engine/core-modules/admin-console/dtos/sign-in-to-admin-console.input';
import { AdminConsoleSessionService } from 'src/engine/core-modules/admin-console/services/admin-console-session.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@AdminResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class AdminConsoleSignInResolver {
  constructor(
    private readonly adminConsoleSessionService: AdminConsoleSessionService,
  ) {}

  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @Mutation(() => Boolean)
  async signInToAdminConsole(
    @Args() { loginToken }: SignInToAdminConsoleInput,
    @Context() context: { req: Request },
  ): Promise<boolean> {
    await this.adminConsoleSessionService.signIn({
      loginToken,
      request: context.req,
    });

    return true;
  }
}
