import { UseFilters } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ResendEmailVerificationTokenInput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.input';
import { ResendEmailVerificationTokenOutput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.output';
import { EmailVerificationExceptionFilter } from 'src/engine/core-modules/email-verification/email-verification-exception-filter.util';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';

@Resolver()
@UseFilters(EmailVerificationExceptionFilter)
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  @Mutation(() => ResendEmailVerificationTokenOutput)
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
      context.req.headers['x-locale'] ?? SOURCE_LOCALE,
    );
  }
}
