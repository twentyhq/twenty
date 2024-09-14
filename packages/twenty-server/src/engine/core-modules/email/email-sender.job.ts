import { SendMailOptions } from 'nodemailer';

import { EmailSenderService } from 'src/engine/core-modules/email/email-sender.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';

@Processor(MessageQueue.emailQueue)
export class EmailSenderJob {
  constructor(private readonly emailSenderService: EmailSenderService) {}

  @Process(EmailSenderJob.name)
  async handle(data: SendMailOptions): Promise<void> {
    await this.emailSenderService.send(data);
  }
}
