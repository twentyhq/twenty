import { Logger } from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';

import { ResetPasswordService } from 'src/engine/core-modules/auth/services/reset-password.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type EmailPasswordResetLinkJobData = {
  email: string;
  workspaceId?: string;
  locale: keyof typeof APP_LOCALES;
};

@Processor(MessageQueue.emailQueue)
export class EmailPasswordResetLinkJob {
  private readonly logger = new Logger(EmailPasswordResetLinkJob.name);

  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Process(EmailPasswordResetLinkJob.name)
  async handle(data: EmailPasswordResetLinkJobData): Promise<void> {
    const generationResult =
      await this.resetPasswordService.generatePasswordResetToken(
        data.email,
        data.workspaceId,
      );

    if (generationResult.status !== 'TOKEN_GENERATED') {
      this.logger.warn(
        `Password reset request silently ignored: ${generationResult.status}`,
      );

      return;
    }

    await this.resetPasswordService.sendEmailPasswordResetLink({
      resetToken: generationResult.resetToken,
      user: generationResult.user,
      workspace: generationResult.workspace,
      locale: data.locale,
    });
  }
}
