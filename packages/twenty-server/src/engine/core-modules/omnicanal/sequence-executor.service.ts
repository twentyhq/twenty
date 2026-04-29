import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EmailSequenceEntity, SequenceStepEntity, StepType } from './sequence.entity';
import { SequenceEnrollmentEntity, EnrollmentStatus } from './sequence-enrollment.entity';
import { EmailSequenceService } from './sequence.service';
import { WhatsAppService } from './whatsapp.service';
import { UnifiedInboxService } from './unified-inbox.service';
import { InboxChannel } from './unified-inbox.entity';
import { SMSConfigEntity, SMSLogEntity } from './sms.entity';

@Injectable()
export class SequenceExecutorService {
  private readonly logger = new Logger(SequenceExecutorService.name);

  constructor(
    @InjectRepository(EmailSequenceEntity)
    private readonly sequenceRepo: Repository<EmailSequenceEntity>,
    @InjectRepository(SequenceStepEntity)
    private readonly stepRepo: Repository<SequenceStepEntity>,
    @InjectRepository(SequenceEnrollmentEntity)
    private readonly enrollmentRepo: Repository<SequenceEnrollmentEntity>,
    @InjectRepository(SMSConfigEntity)
    private readonly smsConfigRepo: Repository<SMSConfigEntity>,
    @InjectRepository(SMSLogEntity)
    private readonly smsLogRepo: Repository<SMSLogEntity>,
    private readonly sequenceService: EmailSequenceService,
    private readonly whatsAppService: WhatsAppService,
    private readonly unifiedInboxService: UnifiedInboxService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async executeSequences(): Promise<void> {
    const workspaces = await this.sequenceRepo
      .createQueryBuilder('sequence')
      .select('sequence.workspaceId')
      .where('sequence.status = :status', { status: 'active' })
      .distinct(true)
      .getRawMany();

    for (const { workspaceId } of workspaces) {
      try {
        await this.processWorkspaceSequences(workspaceId);
      } catch (error) {
        this.logger.error(`Error processing workspace ${workspaceId}:`, error);
      }
    }
  }

  private async processWorkspaceSequences(workspaceId: string): Promise<void> {
    const pendingEnrollments = await this.sequenceService.getPendingActions(workspaceId, 50);

    for (const enrollment of pendingEnrollments) {
      try {
        await this.processEnrollment(enrollment);
      } catch (error) {
        this.logger.error(`Error processing enrollment ${enrollment.id}:`, error);
      }
    }
  }

  private async processEnrollment(enrollment: SequenceEnrollmentEntity): Promise<void> {
    if (!enrollment.currentStepId) {
      this.logger.warn(`Enrollment ${enrollment.id} has no current step`);
      return;
    }

    const step = await this.stepRepo.findOne({
      where: { id: enrollment.currentStepId },
    });

    if (!step) {
      this.logger.warn(`Step not found for enrollment ${enrollment.id}`);
      return;
    }

    switch (step.type) {
      case StepType.EMAIL:
        await this.sendEmail(enrollment, step);
        await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'email_sent');
        break;
      case StepType.SMS:
        await this.sendSms(enrollment, step);
        await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'sms_sent');
        break;
      case StepType.TASK:
        await this.createTask(enrollment, step);
        await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'task_created');
        break;
      case StepType.WHATSAPP:
        await this.sendWhatsApp(enrollment, step);
        await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'sms_sent');
        break;
      case StepType.LINKEDIN:
        await this.sendLinkedIn(enrollment, step);
        await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'email_sent');
        break;
      case StepType.CALL:
        await this.scheduleCall(enrollment, step);
        await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'task_created');
        break;
      case StepType.WAIT:
        await this.handleWaitStep(enrollment, step);
        return;
    }

    await this.sequenceService.advanceToNextStep(enrollment.id);
  }

  // --- EMAIL: Create unified conversation + send via workflow mail-sender ---
  private async sendEmail(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { subject?: string; body?: string; templateId?: string };

    const conv = await this.unifiedInboxService.createConversation(enrollment.workspaceId, {
      channel: InboxChannel.EMAIL,
      contactId: enrollment.contactId,
      subject: config.subject,
      participantIdentifier: enrollment.contactId,
    });

    await this.unifiedInboxService.sendMessage(conv.id, {
      body: config.body ?? '',
      senderName: 'Sequence Automation',
    });

    this.logger.log(`Email sent to contact ${enrollment.contactId}: ${config.subject}`);
  }

  // --- SMS: Use Twilio HTTP API via configured credentials ---
  private async sendSms(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { body?: string; to?: string };
    const smsConfig = await this.smsConfigRepo.findOne({
      where: { workspaceId: enrollment.workspaceId, enabled: true },
    });

    if (smsConfig?.apiKey && smsConfig?.apiSecret && smsConfig?.fromNumber) {
      try {
        const credentials = Buffer.from(`${smsConfig.apiKey}:${smsConfig.apiSecret}`).toString('base64');
        const formData = new URLSearchParams();
        formData.append('To', config.to ?? enrollment.contactId);
        formData.append('From', smsConfig.fromNumber);
        formData.append('Body', config.body ?? '');

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${smsConfig.apiKey}/Messages.json`,
          { method: 'POST', headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData },
        );

        const delivered = response.ok;
        await this.smsLogRepo.save(this.smsLogRepo.create({
          workspaceId: enrollment.workspaceId, to: config.to ?? enrollment.contactId,
          body: config.body ?? '', delivered,
        }));

        this.logger.log(`SMS ${delivered ? 'sent' : 'failed'} to ${config.to ?? enrollment.contactId}`);
      } catch (error) {
        this.logger.error(`SMS send failed for enrollment ${enrollment.id}:`, error);
        await this.smsLogRepo.save(this.smsLogRepo.create({
          workspaceId: enrollment.workspaceId, to: config.to ?? enrollment.contactId,
          body: config.body ?? '', delivered: false,
        }));
      }
    } else {
      this.logger.warn(`No SMS config for workspace ${enrollment.workspaceId}, logging only`);
      await this.smsLogRepo.save(this.smsLogRepo.create({
        workspaceId: enrollment.workspaceId, to: config.to ?? enrollment.contactId,
        body: config.body ?? '', delivered: false,
      }));
    }
  }

  // --- TASK: Create via unified inbox as internal conversation ---
  private async createTask(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { title?: string; description?: string; dueInDays?: number; assigneeId?: string };

    const conv = await this.unifiedInboxService.createConversation(enrollment.workspaceId, {
      channel: InboxChannel.EMAIL,
      contactId: enrollment.contactId,
      subject: `[Task] ${config.title ?? 'Follow-up'}`,
      participantIdentifier: enrollment.contactId,
    });

    await this.unifiedInboxService.sendMessage(conv.id, {
      body: config.description ?? `Follow up with contact ${enrollment.contactId}`,
      isInternal: true,
      senderName: 'Sequence Automation',
    });

    this.logger.log(`Task created for contact ${enrollment.contactId}: ${config.title}`);
  }

  // --- WHATSAPP: Send via WhatsAppService with template support ---
  private async sendWhatsApp(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { templateId?: string; body?: string; to?: string; variables?: Record<string, string> };

    if (config.templateId && config.variables) {
      await this.unifiedInboxService.sendWAFromTemplate(
        enrollment.workspaceId,
        config.templateId,
        config.to ?? enrollment.contactId,
        config.variables,
      );
    } else {
      await this.whatsAppService.sendMessage(
        enrollment.workspaceId,
        config.to ?? enrollment.contactId,
        config.body ?? '',
      );
    }

    this.logger.log(`WhatsApp sent to contact ${enrollment.contactId}`);
  }

  // --- LINKEDIN: Send via unified inbox LinkedIn channel ---
  private async sendLinkedIn(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { body?: string; profileUrl?: string };

    const conv = await this.unifiedInboxService.createConversation(enrollment.workspaceId, {
      channel: InboxChannel.LINKEDIN,
      contactId: enrollment.contactId,
      participantIdentifier: config.profileUrl ?? enrollment.contactId,
    });

    await this.unifiedInboxService.sendMessage(conv.id, {
      body: config.body ?? '',
      senderName: 'Sequence Automation',
    });

    this.logger.log(`LinkedIn message queued for contact ${enrollment.contactId}`);
  }

  // --- CALL: Schedule via unified inbox voice channel ---
  private async scheduleCall(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { priority?: string; script?: string; phoneNumber?: string };

    const conv = await this.unifiedInboxService.createConversation(enrollment.workspaceId, {
      channel: InboxChannel.VOICE,
      contactId: enrollment.contactId,
      subject: `Scheduled call - ${config.priority ?? 'normal'} priority`,
      participantIdentifier: config.phoneNumber ?? enrollment.contactId,
    });

    await this.unifiedInboxService.sendMessage(conv.id, {
      body: config.script ?? `Call contact ${enrollment.contactId}`,
      isInternal: true,
      senderName: 'Sequence Automation',
    });

    this.logger.log(`Call scheduled for contact ${enrollment.contactId}`);
  }

  private async handleWaitStep(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as { delayMinutes?: number };
    const delayMinutes = config.delayMinutes || 0;
    const nextActionAt = new Date();
    nextActionAt.setMinutes(nextActionAt.getMinutes() + delayMinutes);
    enrollment.nextActionAt = nextActionAt;
    await this.enrollmentRepo.save(enrollment);
    this.logger.log(`Wait step for enrollment ${enrollment.id}, next action at ${nextActionAt}`);
  }

  async processReply(workspaceId: string, contactId: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { workspaceId, contactId, status: EnrollmentStatus.ACTIVE },
    });
    if (!enrollment) return;
    await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'replied');
    this.logger.log(`Contact ${contactId} replied to sequence ${enrollment.sequenceId}`);
  }

  async processEmailOpen(workspaceId: string, contactId: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { workspaceId, contactId, status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.REPLIED]) },
    });
    if (!enrollment) return;
    await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'email_opened');
  }

  async processEmailClick(workspaceId: string, contactId: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { workspaceId, contactId, status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.REPLIED]) },
    });
    if (!enrollment) return;
    await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'email_clicked');
  }
}
