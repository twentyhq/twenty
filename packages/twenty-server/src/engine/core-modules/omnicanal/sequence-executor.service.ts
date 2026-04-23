import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EmailSequenceEntity, SequenceStepEntity, StepType } from './sequence.entity';
import { SequenceEnrollmentEntity, EnrollmentStatus } from './sequence-enrollment.entity';
import { EmailSequenceService } from './sequence.service';

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
    private readonly sequenceService: EmailSequenceService,
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
      case StepType.WAIT:
        await this.handleWaitStep(enrollment, step);
        return;
    }

    await this.sequenceService.advanceToNextStep(enrollment.id);
  }

  private async sendEmail(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as {
      subject?: string;
      body?: string;
      templateId?: string;
    };

    this.logger.log(
      `Sending email to contact ${enrollment.contactId}: ${config.subject}`,
    );

    // TODO: Integrate with email service
    // This would call the actual email sending logic
  }

  private async sendSms(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as {
      body?: string;
    };

    this.logger.log(
      `Sending SMS to contact ${enrollment.contactId}: ${config.body?.substring(0, 50)}`,
    );

    // TODO: Integrate with SMS service (Twilio)
  }

  private async createTask(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as {
      title?: string;
      description?: string;
      dueInDays?: number;
    };

    this.logger.log(
      `Creating task for contact ${enrollment.contactId}: ${config.title}`,
    );

    // TODO: Create task in the tasks module
  }

  private async handleWaitStep(
    enrollment: SequenceEnrollmentEntity,
    step: SequenceStepEntity,
  ): Promise<void> {
    const config = step.config as {
      delayMinutes?: number;
    };

    const delayMinutes = config.delayMinutes || 0;
    const nextActionAt = new Date();
    nextActionAt.setMinutes(nextActionAt.getMinutes() + delayMinutes);

    enrollment.nextActionAt = nextActionAt;
    await this.enrollmentRepo.save(enrollment);

    this.logger.log(
      `Wait step for enrollment ${enrollment.id}, next action at ${nextActionAt}`,
    );
  }

  async processReply(
    workspaceId: string,
    contactId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        workspaceId,
        contactId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      return;
    }

    await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'replied');

    this.logger.log(
      `Contact ${contactId} replied to sequence ${enrollment.sequenceId}`,
    );
  }

  async processEmailOpen(
    workspaceId: string,
    contactId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        workspaceId,
        contactId,
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.REPLIED]),
      },
    });

    if (!enrollment) {
      return;
    }

    await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'email_opened');
  }

  async processEmailClick(
    workspaceId: string,
    contactId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        workspaceId,
        contactId,
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.REPLIED]),
      },
    });

    if (!enrollment) {
      return;
    }

    await this.sequenceService.updateEnrollmentAfterAction(enrollment.id, 'email_clicked');
  }
}
