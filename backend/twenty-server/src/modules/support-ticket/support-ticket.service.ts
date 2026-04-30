import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  SupportTicketEntity,
  SLAPolicyEntity,
  TicketCommentEntity,
  TicketStatus,
  TicketPriority,
  TicketChannel,
  TicketCategory,
} from './support-ticket.entity';

@Injectable()
export class SupportTicketService {
  constructor(
    @InjectRepository(SupportTicketEntity)
    private readonly ticketRepo: Repository<SupportTicketEntity>,
    @InjectRepository(SLAPolicyEntity)
    private readonly slaRepo: Repository<SLAPolicyEntity>,
    @InjectRepository(TicketCommentEntity)
    private readonly commentRepo: Repository<TicketCommentEntity>,
  ) {}

  async createTicket(
    workspaceId: string,
    data: {
      subject: string;
      description?: string;
      priority?: TicketPriority;
      channel?: TicketChannel;
      category?: TicketCategory;
      accountId?: string;
      contactId?: string;
      parentTicketId?: string;
    },
  ): Promise<SupportTicketEntity> {
    const ticket = this.ticketRepo.create({ workspaceId, ...data });
    return this.ticketRepo.save(ticket);
  }

  async assignTicket(ticketId: string, assigneeId: string): Promise<SupportTicketEntity> {
    const ticket = await this.findTicketOrFail(ticketId);
    ticket.assigneeId = assigneeId;
    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }
    return this.ticketRepo.save(ticket);
  }

  async routeByRules(
    workspaceId: string,
    ticketId: string,
    rules: Array<{ field: string; value: string; assigneeId: string }>,
  ): Promise<SupportTicketEntity> {
    const ticket = await this.findTicketOrFail(ticketId);
    for (const rule of rules) {
      if ((ticket as unknown as Record<string, unknown>)[rule.field] === rule.value) {
        return this.assignTicket(ticketId, rule.assigneeId);
      }
    }
    return ticket;
  }

  async escalateTicket(ticketId: string, reason: string): Promise<SupportTicketEntity> {
    const ticket = await this.findTicketOrFail(ticketId);
    ticket.status = TicketStatus.ESCALATED;
    ticket.priority = TicketPriority.URGENT;
    const saved = await this.ticketRepo.save(ticket);
    await this.addComment(ticketId, 'system', `Escalated: ${reason}`, true);
    return saved;
  }

  async resolveTicket(ticketId: string): Promise<SupportTicketEntity> {
    const ticket = await this.findTicketOrFail(ticketId);
    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();
    return this.ticketRepo.save(ticket);
  }

  async addComment(
    ticketId: string,
    authorId: string,
    body: string,
    isInternal = false,
  ): Promise<TicketCommentEntity> {
    const ticket = await this.findTicketOrFail(ticketId);
    if (!ticket.firstResponseAt && !isInternal) {
      ticket.firstResponseAt = new Date();
      await this.ticketRepo.save(ticket);
    }
    return this.commentRepo.save(
      this.commentRepo.create({ ticketId, authorId, body, isInternal }),
    );
  }

  async getComments(ticketId: string): Promise<TicketCommentEntity[]> {
    return this.commentRepo.find({ where: { ticketId }, order: { createdAt: 'ASC' } });
  }

  async createSLAPolicy(
    workspaceId: string,
    data: {
      name: string;
      priority: TicketPriority;
      firstResponseMinutes: number;
      resolutionMinutes: number;
    },
  ): Promise<SLAPolicyEntity> {
    return this.slaRepo.save(this.slaRepo.create({ workspaceId, ...data }));
  }

  async checkSLABreaches(workspaceId: string): Promise<SupportTicketEntity[]> {
    const policies = await this.slaRepo.find({ where: { workspaceId, isActive: true } });
    const breached: SupportTicketEntity[] = [];

    for (const policy of policies) {
      const cutoff = new Date(Date.now() - policy.resolutionMinutes * 60_000);
      const tickets = await this.ticketRepo.find({
        where: {
          workspaceId,
          priority: policy.priority,
          status: TicketStatus.IN_PROGRESS,
          createdAt: LessThan(cutoff),
        },
      });
      breached.push(...tickets);
    }

    return breached;
  }

  async submitCSAT(ticketId: string, score: number, feedback?: string): Promise<SupportTicketEntity> {
    const ticket = await this.findTicketOrFail(ticketId);
    ticket.csatScore = score;
    ticket.csatFeedback = feedback ?? undefined;
    return this.ticketRepo.save(ticket);
  }

  async getMetrics(workspaceId: string): Promise<{
    open: number;
    avgFirstResponse: number;
    avgResolution: number;
    csat: number;
    fcrRate: number;
  }> {
    const tickets = await this.ticketRepo.find({ where: { workspaceId } });
    const resolved = tickets.filter((t) => t.resolvedAt);
    const withCsat = tickets.filter((t) => t.csatScore !== null);
    const reopened = tickets.filter((t) => t.status === TicketStatus.OPEN && t.resolvedAt);

    const avgFirstResponse = resolved.length
      ? resolved
          .filter((t) => t.firstResponseAt)
          .reduce((sum, t) => sum + (t.firstResponseAt.getTime() - t.createdAt.getTime()), 0) /
        resolved.filter((t) => t.firstResponseAt).length / 60_000
      : 0;

    const avgResolution = resolved.length
      ? resolved.reduce(
          (sum, t) => sum + (t.resolvedAt.getTime() - t.createdAt.getTime()),
          0,
        ) / resolved.length / 60_000
      : 0;

    return {
      open: tickets.filter((t) => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS).length,
      avgFirstResponse: Math.round(avgFirstResponse),
      avgResolution: Math.round(avgResolution),
      csat: withCsat.length ? withCsat.reduce((s, t) => s + t.csatScore, 0) / withCsat.length : 0,
      fcrRate: resolved.length ? ((resolved.length - reopened.length) / resolved.length) * 100 : 0,
    };
  }

  private async findTicketOrFail(ticketId: string): Promise<SupportTicketEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);
    return ticket;
  }
}
