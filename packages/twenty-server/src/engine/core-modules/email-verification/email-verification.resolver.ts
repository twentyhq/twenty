import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ResendEmailVerificationTokenInput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.input';
import { ResendEmailVerificationTokenOutput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.output';
import { EmailVerificationExceptionFilter } from 'src/engine/core-modules/email-verification/email-verification-exception-filter.util';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
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
    private readonly domainManagerService: DomainManagerService,
  ) {}

  // TODO: this should be an authenticated endpoint
  @Mutation(() => ResendEmailVerificationTokenOutput)
  @UseGuards(PublicEndpointGuard)
  async resendEmailVerificationToken(
    @Args()
    resendEmailVerificationTokenInput: ResendEmailVerificationTokenInput,
    @Args('origin') origin: string,
    @Context() context: I18nContext,
  ): Promise<ResendEmailVerificationTokenOutput> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    return await this.emailVerificationService.resendEmailVerificationToken(
      resendEmailVerificationTokenInput.email,
      workspace,
      context.req.locale,
    );
  }
}
