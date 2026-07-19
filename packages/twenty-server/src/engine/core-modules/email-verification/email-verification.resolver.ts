import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResendEmailVerificationTokenInput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.input';
import { ResendEmailVerificationTokenDTO } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.dto';
import { EmailVerificationExceptionFilter } from 'src/engine/core-modules/email-verification/email-verification-exception-filter.util';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const RESEND_EMAIL_VERIFICATION_RATE_LIMIT_MAX = 10;
const RESEND_EMAIL_VERIFICATION_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

type EmailVerificationContext = I18nContext & {
  req: I18nContext['req'] & { ip?: string };
};

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  EmailVerificationExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Mutation(() => ResendEmailVerificationTokenDTO)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async resendEmailVerificationToken(
    @Args()
    resendEmailVerificationTokenInput: ResendEmailVerificationTokenInput,
    @Args('origin') origin: string,
    @Context() context: EmailVerificationContext,
  ): Promise<ResendEmailVerificationTokenDTO> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `email-verification-resend:${context.req.ip ?? 'unknown'}`,
        1,
        RESEND_EMAIL_VERIFICATION_RATE_LIMIT_MAX,
        RESEND_EMAIL_VERIFICATION_RATE_LIMIT_WINDOW_MS,
      );
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw new EmailVerificationException(
          'Email verification resend rate limit exceeded',
          EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED,
        );
      }

      throw error;
    }

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
