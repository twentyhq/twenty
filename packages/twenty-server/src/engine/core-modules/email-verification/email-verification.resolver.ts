import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ResendEmailVerificationTokenInput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.input';
import { ResendEmailVerificationTokenOutput } from 'src/engine/core-modules/email-verification/dtos/resend-email-verification-token.output';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';

@Resolver()
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Mutation(() => ResendEmailVerificationTokenOutput)
  async resendEmailVerificationToken(
    @Args()
    resendEmailVerificationTokenInput: ResendEmailVerificationTokenInput,
  ): Promise<ResendEmailVerificationTokenOutput> {
    return await this.emailVerificationService.resendEmailVerificationToken(
      resendEmailVerificationTokenInput.email,
    );
  }
}
