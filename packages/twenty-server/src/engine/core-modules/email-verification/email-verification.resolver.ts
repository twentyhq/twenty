import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { ResendEmailVerificationTokenInput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.input';
import { ResendEmailVerificationTokenOutput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.output';
import { EmailVerificationExceptionFilter } from 'src/engine/core-modules/email-verification/email-verification-exception-filter.util';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  EmailVerificationExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {}

  // TODO: this should be an authenticated endpoint
  @Mutation(() => ResendEmailVerificationTokenOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async resendEmailVerificationToken(
    @Args()
    resendEmailVerificationTokenInput: ResendEmailVerificationTokenInput,
    @Args('origin') origin: string,
    @Context() context: I18nContext,
  ): Promise<ResendEmailVerificationTokenOutput> {
    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    return await this.emailVerificationService.resendEmailVerificationToken(
      resendEmailVerificationTokenInput.email,
      workspace,
      context.req.locale,
    );
  }
}
