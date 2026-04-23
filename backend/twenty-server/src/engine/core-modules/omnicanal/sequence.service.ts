import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  EmailSequenceEntity,
  SequenceStepEntity,
  SequenceStatus,
  StepType,
} from './sequence.entity';
import { SequenceEnrollmentEntity, EnrollmentStatus } from './sequence-enrollment.entity';

export interface CreateSequenceInput {
  name: string;
  description?: string;
}

export interface AddStepInput {
  type: StepType;
  order: number;
  config: Record<string, unknown>;
}

@Injectable()
export class EmailSequenceService {
  constructor(
    @InjectRepository(EmailSequenceEntity)
    private readonly sequenceRepo: Repository<EmailSequenceEntity>,
    @InjectRepository(SequenceStepEntity)
    private readonly stepRepo: Repository<SequenceStepEntity>,
    @InjectRepository(SequenceEnrollmentEntity)
    private readonly enrollmentRepo: Repository<SequenceEnrollmentEntity>,
  ) {}

  async createSequence(
    workspaceId: string,
    data: CreateSequenceInput,
  ): Promise<EmailSequenceEntity> {
    const sequence = this.sequenceRepo.create({
      workspaceId,
      name: data.name,
      description: data.description,
      status: SequenceStatus.DRAFT,
    });

    return this.sequenceRepo.save(sequence);
  }

  async getSequence(workspaceId: string, id: string): Promise<EmailSequenceEntity> {
    const sequence = await this.sequenceRepo.findOne({
      where: { id, workspaceId },
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence ${id} not found`);
    }

    return sequence;
  }

  async getSequences(
    workspaceId: string,
    options?: { status?: SequenceStatus },
  ): Promise<EmailSequenceEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (options?.status) {
      where.status = options.status;
    }

    return this.sequenceRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async addStep(
    workspaceId: string,
    sequenceId: string,
    data: AddStepInput,
  ): Promise<SequenceStepEntity> {
    const sequence = await this.getSequence(workspaceId, sequenceId);

    const step = this.stepRepo.create({
      sequenceId: sequence.id,
      order: data.order,
      type: data.type,
      config: data.config,
    });

    return this.stepRepo.save(step);
  }

  async getSteps(sequenceId: string): Promise<SequenceStepEntity[]> {
    return this.stepRepo.find({
      where: { sequenceId },
      order: { order: 'ASC' },
    });
  }

  async updateSequence(
    workspaceId: string,
    id: string,
    data: Partial<CreateSequenceInput & { status: SequenceStatus }>,
  ): Promise<EmailSequenceEntity> {
    const sequence = await this.getSequence(workspaceId, id);

    Object.assign(sequence, data);

    return this.sequenceRepo.save(sequence);
  }

  async deleteSequence(workspaceId: string, id: string): Promise<void> {
    const sequence = await this.getSequence(workspaceId, id);

    await this.stepRepo.delete({ sequenceId: id });
    await this.enrollmentRepo.delete({ sequenceId: id });
    await this.sequenceRepo.remove(sequence);
  }

  async duplicateSequence(
    workspaceId: string,
    id: string,
    newName: string,
  ): Promise<EmailSequenceEntity> {
    const original = await this.getSequence(workspaceId, id);
    const steps = await this.getSteps(id);

    const newSequence = this.sequenceRepo.create({
      workspaceId,
      name: newName,
      description: original.description,
      status: SequenceStatus.DRAFT,
    });

    const saved = await this.sequenceRepo.save(newSequence);

    for (const step of steps) {
      const newStep = this.stepRepo.create({
        sequenceId: saved.id,
        order: step.order,
        type: step.type,
        config: step.config,
      });
      await this.stepRepo.save(newStep);
    }

    return saved;
  }

  async enrollContact(
    workspaceId: string,
    sequenceId: string,
    contactId: string,
  ): Promise<SequenceEnrollmentEntity> {
    const sequence = await this.getSequence(workspaceId, sequenceId);
    const steps = await this.getSteps(sequenceId);

    if (steps.length === 0) {
      throw new Error('Cannot enroll in sequence without steps');
    }

    const existing = await this.enrollmentRepo.findOne({
      where: { sequenceId, contactId },
    });

    if (existing) {
      throw new Error('Contact already enrolled in this sequence');
    }

    const firstStep = steps[0];
    const nextActionAt = new Date();

    const waitMinutes = (firstStep.config?.delayMinutes as number) || 0;
    nextActionAt.setMinutes(nextActionAt.getMinutes() + waitMinutes);

    const enrollment = this.enrollmentRepo.create({
      workspaceId,
      sequenceId,
      contactId,
      status: EnrollmentStatus.ACTIVE,
      currentStepOrder: 0,
      currentStepId: firstStep.id,
      nextActionAt,
      lastActionAt: new Date(),
    });

    const saved = await this.enrollmentRepo.save(enrollment);

    await this.sequenceRepo.increment({ id: sequenceId }, 'enrolledCount', 1);

    return saved;
  }

  async unenrollContact(
    workspaceId: string,
    sequenceId: string,
    contactId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { sequenceId, contactId, workspaceId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.enrollmentRepo.remove(enrollment);
    await this.sequenceRepo.decrement({ id: sequenceId }, 'enrolledCount', 1);
  }

  async getEnrollments(
    workspaceId: string,
    sequenceId: string,
  ): Promise<SequenceEnrollmentEntity[]> {
    return this.enrollmentRepo.find({
      where: { workspaceId, sequenceId },
      order: { enrolledAt: 'DESC' },
    });
  }

  async getSequenceStats(
    sequenceId: string,
  ): Promise<{
    enrolled: number;
    active: number;
    completed: number;
    replied: number;
    replyRate: number;
  }> {
    const [enrollments, total] = await this.enrollmentRepo.findAndCount({
      where: { sequenceId },
    });

    const active = enrollments.filter((e) => e.status === EnrollmentStatus.ACTIVE).length;
    const completed = enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length;
    const replied = enrollments.filter((e) => e.status === EnrollmentStatus.REPLIED).length;

    return {
      enrolled: total,
      active,
      completed,
      replied,
      replyRate: total > 0 ? (replied / total) * 100 : 0,
    };
  }

  async getPendingActions(
    workspaceId: string,
    limit = 100,
  ): Promise<SequenceEnrollmentEntity[]> {
    const now = new Date();

    return this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .where('enrollment.workspaceId = :workspaceId', { workspaceId })
      .andWhere('enrollment.status = :status', { status: EnrollmentStatus.ACTIVE })
      .andWhere('enrollment.nextActionAt <= :now', { now })
      .orderBy('enrollment.nextActionAt', 'ASC')
      .take(limit)
      .getMany();
  }

  async updateEnrollmentAfterAction(
    enrollmentId: string,
    action:
      | 'email_sent'
      | 'sms_sent'
      | 'task_created'
      | 'email_opened'
      | 'email_clicked'
      | 'replied',
  ): Promise<SequenceEnrollmentEntity> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    switch (action) {
      case 'email_sent':
        enrollment.emailsSent += 1;
        break;
      case 'sms_sent':
        enrollment.smsSent += 1;
        break;
      case 'task_created':
        enrollment.tasksCreated += 1;
        break;
      case 'email_opened':
        enrollment.emailsOpened += 1;
        break;
      case 'email_clicked':
        enrollment.emailsClicked += 1;
        break;
      case 'replied':
        enrollment.replies += 1;
        enrollment.status = EnrollmentStatus.REPLIED;
        enrollment.completedAt = new Date();
        break;
    }

    enrollment.lastActionAt = new Date();

    return this.enrollmentRepo.save(enrollment);
  }

  async advanceToNextStep(enrollmentId: string): Promise<SequenceEnrollmentEntity | null> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const steps = await this.getSteps(enrollment.sequenceId);
    const currentIndex = enrollment.currentStepOrder;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= steps.length) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
      enrollment.nextActionAt = null;

      await this.sequenceRepo.increment({ id: enrollment.sequenceId }, 'completedCount', 1);

      return this.enrollmentRepo.save(enrollment);
    }

    const nextStep = steps[nextIndex];
    const waitMinutes = (nextStep.config?.delayMinutes as number) || 0;
    const nextActionAt = new Date();
    nextActionAt.setMinutes(nextActionAt.getMinutes() + waitMinutes);

    enrollment.currentStepOrder = nextIndex;
    enrollment.currentStepId = nextStep.id;
    enrollment.nextActionAt = nextActionAt;

    return this.enrollmentRepo.save(enrollment);
  }

  async activateSequence(
    workspaceId: string,
    id: string,
  ): Promise<EmailSequenceEntity> {
    const sequence = await this.getSequence(workspaceId, id);
    const steps = await this.getSteps(id);

    if (steps.length === 0) {
      throw new Error('Cannot activate sequence without steps');
    }

    sequence.status = SequenceStatus.ACTIVE;
    return this.sequenceRepo.save(sequence);
  }

  async pauseSequence(
    workspaceId: string,
    id: string,
  ): Promise<EmailSequenceEntity> {
    const sequence = await this.getSequence(workspaceId, id);
    sequence.status = SequenceStatus.PAUSED;
    return this.sequenceRepo.save(sequence);
  }
}
