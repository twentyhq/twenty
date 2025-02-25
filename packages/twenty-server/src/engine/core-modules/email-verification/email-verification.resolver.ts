import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { SOURCE_LOCALE } from 'twenty-shared';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ResendEmailVerificationTokenInput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.input';
import { ResendEmailVerificationTokenOutput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.output';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { OriginHeader } from 'src/engine/decorators/auth/origin-header.decorator';

@Resolver()
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  @Mutation(() => ResendEmailVerificationTokenOutput)
  async resendEmailVerificationToken(
    @Args()
    resendEmailVerificationTokenInput: ResendEmailVerificationTokenInput,
    @OriginHeader() origin: string,
    @Context() context: I18nContext,
  ): Promise<ResendEmailVerificationTokenOutput> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    return await this.emailVerificationService.resendEmailVerificationToken(
      resendEmailVerificationTokenInput.email,
      workspace,
      context.req.headers['x-locale'] ?? SOURCE_LOCALE,
    );
  }
}
