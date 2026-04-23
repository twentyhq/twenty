import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MeetingNotesAgent,
  MeetingNotesProvider,
  MeetingNotesStatus,
  MeetingTranscript,
} from './meeting-notes-agent.entity';

@Injectable()
export class MeetingNotesAgentService {
  constructor(
    @InjectRepository(MeetingNotesAgent, 'core')
    private readonly agentRepo: Repository<MeetingNotesAgent>,
    @InjectRepository(MeetingTranscript, 'core')
    private readonly transcriptRepo: Repository<MeetingTranscript>,
  ) {}

  async findAll(workspaceId: string): Promise<MeetingNotesAgent[]> {
    return this.agentRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<MeetingNotesAgent | null> {
    return this.agentRepo.findOne({ where: { id, workspaceId } });
  }

  async create(
    workspaceId: string,
    data: Partial<MeetingNotesAgent> & { name: string },
  ): Promise<MeetingNotesAgent> {
    const agent = this.agentRepo.create({
      ...data,
      workspaceId,
      provider: data.provider ?? MeetingNotesProvider.ZOOM,
      autoJoinEnabled: data.autoJoinEnabled ?? true,
      autoGenerateNotes: data.autoGenerateNotes ?? true,
      autoExtractActionItems: data.autoExtractActionItems ?? true,
      autoSendFollowUp: data.autoSendFollowUp ?? true,
      meetingsProcessedCount: data.meetingsProcessedCount ?? 0,
      actionItemsExtractedCount: data.actionItemsExtractedCount ?? 0,
      followUpsSentCount: data.followUpsSentCount ?? 0,
    });

    return this.agentRepo.save(agent);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<MeetingNotesAgent>,
  ): Promise<MeetingNotesAgent> {
    await this.agentRepo.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`Meeting notes agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<MeetingNotesAgent> {
    return this.update(id, workspaceId, { status: MeetingNotesStatus.PROCESSING });
  }

  async pause(id: string, workspaceId: string): Promise<MeetingNotesAgent> {
    return this.update(id, workspaceId, { status: MeetingNotesStatus.PENDING });
  }

  async recordMeeting(
    workspaceId: string,
    data: {
      meetingId: string;
      transcript?: string;
      dealId?: string;
      contactId?: string;
      duration?: number;
      meetingUrl?: string;
      recordedAt?: Date;
      summary?: Record<string, unknown>;
      keyPoints?: string[];
      actionItems?: Array<{ title: string; owner?: string; dueDate?: string; completed?: boolean }>;
    },
  ): Promise<MeetingTranscript> {
    const actionItems = (data.actionItems ?? []).map((item) => ({
      title: item.title,
      owner: item.owner ?? null,
      dueDate: item.dueDate ?? null,
      completed: item.completed ?? false,
    }));

    const transcript = this.transcriptRepo.create({
      workspaceId,
      meetingId: data.meetingId,
      dealId: data.dealId ?? null,
      contactId: data.contactId ?? null,
      transcript: data.transcript ?? null,
      summary: data.summary ?? this.buildSummary(data.transcript ?? ''),
      actionItems,
      keyPoints: data.keyPoints ?? this.extractKeyPoints(data.transcript ?? ''),
      status: MeetingNotesStatus.COMPLETED,
      duration: data.duration ?? null,
      meetingUrl: data.meetingUrl ?? null,
      recordedAt: data.recordedAt ?? new Date(),
    } as Partial<MeetingTranscript>);

    return this.transcriptRepo.save(transcript as MeetingTranscript) as Promise<MeetingTranscript>;
  }

  async generateFollowUp(
    workspaceId: string,
    meetingId: string,
    agentId?: string,
  ): Promise<{
    subject: string;
    body: string;
  }> {
    const transcript = await this.transcriptRepo.findOne({ where: { workspaceId, meetingId } });
    if (!transcript) throw new NotFoundException(`Meeting transcript ${meetingId} not found`);

    const agent = agentId ? await this.findOne(agentId, workspaceId) : null;
    const summary = transcript.summary ?? {};
    const keyPoints = transcript.keyPoints ?? [];
    const actionItems = this.normalizeActionItems(transcript.actionItems ?? []);
    const meetingName = this.getMeetingName(summary, meetingId);
    const subject = `Follow-up on ${meetingName}`;
    const body = this.buildFollowUpBody({
      meetingName,
      keyPoints,
      actionItems,
      transcript: transcript.transcript ?? '',
      autoSendFollowUp: agent?.autoSendFollowUp ?? true,
      template: agent?.followUpTemplate ?? undefined,
    });

    return { subject, body };
  }

  async summarizeTranscripts(workspaceId: string): Promise<{
    transcripts: number;
    actionItems: number;
    completed: number;
    averageDuration: number;
  }> {
    const transcripts = await this.transcriptRepo.find({ where: { workspaceId } });
    const actionItems = transcripts.reduce((sum, item) => sum + (item.actionItems?.length ?? 0), 0);
    const totalDuration = transcripts.reduce((sum, item) => sum + (item.duration ?? 0), 0);

    return {
      transcripts: transcripts.length,
      actionItems,
      completed: transcripts.filter((item) => item.status === MeetingNotesStatus.COMPLETED).length,
      averageDuration: transcripts.length ? Math.round(totalDuration / transcripts.length) : 0,
    };
  }

  private buildSummary(transcript: string): Record<string, unknown> {
    const keyPoints = this.extractKeyPoints(transcript);
    const actionItems = this.extractActionItems(transcript);
    return {
      summary: transcript.slice(0, 240),
      keyPoints,
      actionItems,
    };
  }

  private extractKeyPoints(transcript: string): string[] {
    if (!transcript) return ['Review objectives', 'Confirm next step'];
    const sentences = transcript
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    return sentences.slice(0, 5).map((sentence) => sentence.slice(0, 120));
  }

  private extractActionItems(transcript: string): Array<{ title: string; owner?: string; dueDate?: string; completed?: boolean }> {
    const items: Array<{ title: string; owner?: string; dueDate?: string; completed?: boolean }> = [];
    const lower = transcript.toLowerCase();

    if (lower.includes('follow up')) items.push({ title: 'Send follow-up recap', completed: false });
    if (lower.includes('proposal')) items.push({ title: 'Share proposal draft', completed: false });
    if (lower.includes('contract')) items.push({ title: 'Review contract terms', completed: false });
    if (lower.includes('next step')) items.push({ title: 'Confirm next step', completed: false });
    if (lower.includes('demo')) items.push({ title: 'Prepare demo materials', completed: false });

    return items;
  }

  private getMeetingName(summary: Record<string, unknown>, meetingId: string): string {
    const title = summary['title'];
    if (typeof title === 'string' && title.trim()) return title.trim();
    return meetingId;
  }

  private buildFollowUpBody(input: {
    meetingName: string;
    keyPoints: string[];
    actionItems: Array<Record<string, unknown>>;
    transcript: string;
    autoSendFollowUp: boolean;
    template?: string;
  }): string {
    const intro = input.template?.trim()
      ? input.template.trim()
      : `Thanks for taking the time to meet about ${input.meetingName}.`;
    const recap = input.keyPoints.length > 0
      ? `Key points: ${input.keyPoints.slice(0, 3).join('; ')}.`
      : 'I wanted to share a short recap of the discussion.';
    const actions = input.actionItems.length > 0
      ? `Action items: ${input.actionItems.slice(0, 3).map((item) => this.getActionItemTitle(item)).join('; ')}.`
      : 'No explicit action items were captured.';
    const close = input.autoSendFollowUp
      ? 'Please let me know if anything should be adjusted.'
      : 'I can send a more detailed follow-up if needed.';

    const body = [intro, recap, actions, close].join('\n\n');
    return this.limitLength(body, 1800);
  }

  private limitLength(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars - 3)}...`;
  }

  private normalizeActionItems(actionItems: Record<string, unknown>[]): Array<Record<string, unknown>> {
    return actionItems.map((item) => ({
      title: this.getActionItemTitle(item),
      owner: typeof item.owner === 'string' ? item.owner : null,
      dueDate: typeof item.dueDate === 'string' ? item.dueDate : null,
      completed: Boolean(item.completed),
    }));
  }

  private getActionItemTitle(item: Record<string, unknown>): string {
    const title = item.title;
    if (typeof title === 'string' && title.trim()) return title.trim();
    return 'Action item';
  }
}
