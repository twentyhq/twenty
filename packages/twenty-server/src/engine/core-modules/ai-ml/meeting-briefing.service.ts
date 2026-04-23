import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

import { BriefingStatus, MeetingBriefingEntity } from './meeting-briefing.entity';

@Injectable()
export class MeetingBriefingService {
  constructor(
    @InjectRepository(MeetingBriefingEntity)
    private readonly briefingRepo: Repository<MeetingBriefingEntity>,
  ) {}

  async createBriefing(
    workspaceId: string,
    data: {
      meetingId: string;
      userId: string;
      meetingTitle?: string;
      meetingDate?: Date;
      meetingWith?: string;
      summary?: string;
      agenda?: string[];
      talkingPoints?: string[];
      actionItems?: string[];
      competitorMentions?: string[];
      company?: Partial<CompanyWorkspaceEntity>;
      person?: Partial<PersonWorkspaceEntity>;
      relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
    },
  ): Promise<MeetingBriefingEntity> {
    const briefing = this.briefingRepo.create({
      workspaceId,
      meetingId: data.meetingId,
      userId: data.userId,
      meetingTitle: data.meetingTitle ?? this.buildMeetingTitle(data),
      meetingDate: data.meetingDate ?? null,
      meetingWith: data.meetingWith ?? this.buildMeetingWith(data),
      status: BriefingStatus.READY,
      summary: data.summary ?? this.buildSummary(data),
      keyPoints: this.buildKeyPoints(data),
      discussionTopics: data.agenda ?? this.buildDiscussionTopics(data),
      suggestedQuestions: this.buildSuggestedQuestions(data),
      talkingPoints: data.talkingPoints ?? this.buildTalkingPoints(data),
      relevantDeals: this.buildRelevantDeals(data),
      companyContext: this.buildCompanyContext(data),
      competitorMentions: data.competitorMentions ?? this.detectCompetitorMentions(data),
      actionItems: data.actionItems ?? this.buildActionItems(data),
      failureReason: null,
      generationTimeMs: this.estimateGenerationTime(data),
      generatedAt: new Date(),
    });

    return (await this.briefingRepo.save(briefing as MeetingBriefingEntity)) as MeetingBriefingEntity;
  }

  async getBriefing(workspaceId: string, meetingId: string): Promise<MeetingBriefingEntity | null> {
    return this.briefingRepo.findOne({ where: { workspaceId, meetingId } });
  }

  async listBriefings(workspaceId: string): Promise<MeetingBriefingEntity[]> {
    return (await this.briefingRepo.find({
      where: { workspaceId },
      order: { generatedAt: 'DESC' },
      take: 20,
    })) as MeetingBriefingEntity[];
  }

  async regenerateBriefing(
    workspaceId: string,
    meetingId: string,
    data: Parameters<MeetingBriefingService['createBriefing']>[1],
  ): Promise<MeetingBriefingEntity> {
    const existing = await this.getBriefing(workspaceId, meetingId);
    if (!existing) {
      throw new NotFoundException(`Meeting briefing ${meetingId} not found`);
    }

    await this.briefingRepo.update(existing.id, {
      status: BriefingStatus.GENERATING,
      failureReason: null,
    });

    return this.createBriefing(workspaceId, data);
  }

  private buildMeetingTitle(data: {
    meetingTitle?: string;
    meetingWith?: string;
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
  }): string {
    const companyName = this.getCompanyName(data.company);
    const personName = this.getPersonName(data.person);

    if (companyName && personName) return `Meeting with ${personName} at ${companyName}`;
    if (companyName) return `Meeting with ${companyName}`;
    if (personName) return `Meeting with ${personName}`;
    if (data.meetingWith) return `Meeting with ${data.meetingWith}`;
    return 'Meeting briefing';
  }

  private buildMeetingWith(data: {
    meetingWith?: string;
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
  }): string {
    return data.meetingWith ?? this.getPersonName(data.person) ?? this.getCompanyName(data.company) ?? 'Unknown attendee';
  }

  private buildSummary(data: {
    meetingTitle?: string;
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
    competitorMentions?: string[];
  }): string {
    const topics = this.buildDiscussionTopics(data);
    const dealCount = data.relevantDeals?.length ?? 0;
    const competitorCount = (data.competitorMentions ?? []).length;

    return [
      data.meetingTitle ?? this.buildMeetingTitle(data),
      topics.length ? `Topics: ${topics.join(', ')}` : null,
      dealCount ? `${dealCount} related deal(s) reviewed` : null,
      competitorCount ? `${competitorCount} competitor mention(s)` : null,
    ]
      .filter((item): item is string => Boolean(item))
      .join('. ');
  }

  private buildKeyPoints(data: {
    summary?: string;
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
    competitorMentions?: string[];
  }): string[] {
    const keyPoints: string[] = [];
    const summary = data.summary ?? '';
    if (summary) keyPoints.push(summary.slice(0, 120));
    if ((data.relevantDeals ?? []).length > 0) keyPoints.push(`${data.relevantDeals!.length} relevant deal(s)`);
    if ((data.competitorMentions ?? []).length > 0) keyPoints.push(`Competitors: ${data.competitorMentions!.join(', ')}`);
    return keyPoints.length > 0 ? keyPoints : ['Review account context', 'Align on next step'];
  }

  private buildDiscussionTopics(data: {
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
  }): string[] {
    const topics: string[] = [];
    const companyName = this.getCompanyName(data.company);
    const personName = this.getPersonName(data.person);

    if (companyName) topics.push(`${companyName} account priorities`);
    if (personName) topics.push(`${personName} goals and blockers`);
    if ((data.relevantDeals ?? []).length > 0) topics.push('Open opportunities and next step');
    topics.push('Risks, timing, and decision process');
    return topics;
  }

  private buildSuggestedQuestions(data: {
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
    competitorMentions?: string[];
  }): string[] {
    const questions: string[] = [
      'What is the business outcome you want to achieve?',
      'What is blocking a decision right now?',
      'Who else needs to be involved in the decision?',
    ];

    if ((data.relevantDeals ?? []).length > 0) {
      questions.push('Which opportunity is most urgent for this account?');
    }

    if ((data.competitorMentions ?? []).length > 0) {
      questions.push('What do you like or dislike about the competitor option?');
    }

    return questions;
  }

  private buildTalkingPoints(data: {
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
  }): string[] {
    const talkingPoints: string[] = [];
    const companyName = this.getCompanyName(data.company);
    const personName = this.getPersonName(data.person);

    if (companyName) talkingPoints.push(`Frame the conversation around ${companyName}'s priorities.`);
    if (personName) talkingPoints.push(`Keep the discussion aligned with ${personName}'s role and goals.`);
    if ((data.relevantDeals ?? []).length > 0) talkingPoints.push('Use the active deal context to anchor next steps.');
    talkingPoints.push('Close with a clear next step and owner.');
    return talkingPoints;
  }

  private buildRelevantDeals(data: {
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
  }): Array<{ id: string; name: string; value: number; stage: string }> {
    return (data.relevantDeals ?? []).map((deal, index) => ({
      id: deal.id ?? `deal-${index + 1}`,
      name: deal.name ?? `Deal ${index + 1}`,
      value: this.extractDealValue(deal),
      stage: deal.stage ?? 'prospecting',
    }));
  }

  private buildCompanyContext(data: {
    company?: Partial<CompanyWorkspaceEntity>;
    person?: Partial<PersonWorkspaceEntity>;
  }): Record<string, unknown> {
    const companyName = this.getCompanyName(data.company);
    const personName = this.getPersonName(data.person);
    return {
      companyName,
      personName,
      domainName: data.company?.domainName ?? null,
      annualRecurringRevenue: data.company?.annualRecurringRevenue ?? null,
      idealCustomerProfile: data.company?.idealCustomerProfile ?? null,
      jobTitle: data.person?.jobTitle ?? null,
    };
  }

  private detectCompetitorMentions(data: {
    summary?: string;
    competitorMentions?: string[];
  }): string[] {
    const mentions = new Set<string>(data.competitorMentions ?? []);
    const text = `${data.summary ?? ''}`.toLowerCase();
    const competitorKeywords = ['salesforce', 'hubspot', 'pipedrive', 'zoho', 'monday', 'servicenow', 'zendesk'];

    for (const keyword of competitorKeywords) {
      if (text.includes(keyword)) mentions.add(keyword);
    }

    return [...mentions];
  }

  private buildActionItems(data: {
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
    competitorMentions?: string[];
  }): string[] {
    const actionItems = ['Confirm next meeting date', 'Share recap with agreed actions'];
    if ((data.relevantDeals ?? []).length > 0) actionItems.unshift('Update deal owners and next steps');
    if ((data.competitorMentions ?? []).length > 0) actionItems.push('Address competitor objections');
    return actionItems;
  }

  private estimateGenerationTime(data: {
    relevantDeals?: Array<Partial<OpportunityWorkspaceEntity> & { value?: number }>;
    competitorMentions?: string[];
    summary?: string;
  }): number {
    const complexity =
      (data.relevantDeals?.length ?? 0) * 20 +
      (data.competitorMentions?.length ?? 0) * 10 +
      (data.summary?.length ?? 0) / 40;
    return Math.max(15, Math.min(600, Math.round(complexity)));
  }

  private extractDealValue(deal: Partial<OpportunityWorkspaceEntity> & { value?: number }): number {
    if (typeof deal.value === 'number') return deal.value;
    const amount = deal.amount as unknown;
    if (typeof amount === 'object' && amount && 'amount' in amount) {
      const maybe = (amount as { amount?: number }).amount;
      return typeof maybe === 'number' ? maybe : 0;
    }
    if (typeof amount === 'number') return amount;
    return 0;
  }

  private getCompanyName(company?: Partial<CompanyWorkspaceEntity>): string | null {
    const name = company?.name;
    return typeof name === 'string' && name.trim() ? name.trim() : null;
  }

  private getPersonName(person?: Partial<PersonWorkspaceEntity>): string | null {
    if (!person?.name) return null;
    if (typeof person.name === 'string') return person.name;

    const name = person.name as unknown as {
      displayName?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      name?: string;
    };

    const displayName = name.displayName ?? name.name;
    if (displayName) return displayName;

    return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(' ') || null;
  }
}
