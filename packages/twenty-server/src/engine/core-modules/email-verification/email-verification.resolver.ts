import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { VerifyEmailInput } from 'src/engine/core-modules/email-verification/dots/verify-email.input';
import { VerifyEmailOutput } from 'src/engine/core-modules/email-verification/dots/verify-email.output';

import { EmailVerificationService } from './services/email-verification.service';

@Resolver()
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Mutation(() => VerifyEmailOutput)
  // TODO#8240 - Add auth guard?
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    await this.emailVerificationService.verifyEmailVerificationToken(
      input.token,
    );

    return { success: true };
  }
}
