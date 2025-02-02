import { SendMailOptions } from 'nodemailer';

import { EmailSenderService } from 'src/engine/core-modules/email/email-sender.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.emailQueue)
export class EmailSenderJob {
  constructor(
    private readonly emailSenderService: EmailSenderService,
    private readonly i18nService: I18nService,
  ) {}

  @Process(EmailSenderJob.name)
  async handle(data: SendMailOptions): Promise<void> {
    await this.i18nService.loadEmailTranslations();
    await this.emailSenderService.send(data);
  }
}
