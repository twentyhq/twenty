import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PersonalizationProfileEntity, PersonalizationRuleEntity, PersonalizationEventEntity,
  EventType, RuleOperator,
} from './hyper-personalization.entity';

@Injectable()
export class HyperPersonalizationService {
  private readonly logger = new Logger(HyperPersonalizationService.name);

  constructor(
    @InjectRepository(PersonalizationProfileEntity) private readonly profileRepo: Repository<PersonalizationProfileEntity>,
    @InjectRepository(PersonalizationRuleEntity) private readonly ruleRepo: Repository<PersonalizationRuleEntity>,
    @InjectRepository(PersonalizationEventEntity) private readonly eventRepo: Repository<PersonalizationEventEntity>,
  ) {}

  async createProfile(workspaceId: string, data: Partial<PersonalizationProfileEntity>): Promise<PersonalizationProfileEntity> {
    return this.profileRepo.save(this.profileRepo.create({ workspaceId, ...data }));
  }

  async addRule(workspaceId: string, data: Partial<PersonalizationRuleEntity>): Promise<PersonalizationRuleEntity> {
    return this.ruleRepo.save(this.ruleRepo.create({ workspaceId, ...data }));
  }

  async trackEvent(workspaceId: string, data: Partial<PersonalizationEventEntity>): Promise<PersonalizationEventEntity> {
    const event = await this.eventRepo.save(this.eventRepo.create({ workspaceId, ...data }));

    // Update profile interaction stats
    const profile = await this.profileRepo.findOne({
      where: { workspaceId, contactId: data.contactId },
    });

    if (profile) {
      profile.totalInteractions++;
      profile.lastInteractionAt = new Date();
      profile.engagementScore = await this.calculateEngagementScore(workspaceId, profile.contactId);
      await this.profileRepo.save(profile);
    }

    return event;
  }

  async getPersonalizedContent(workspaceId: string, contactId: string, channel: string): Promise<{
    profileId: string; segment: string; matchedRules: Array<{ ruleId: string; name: string; contentVariant: Record<string, string> }>;
  }> {
    const profile = await this.profileRepo.findOne({ where: { workspaceId, contactId } });
    if (!profile) throw new NotFoundException(`Profile for contact ${contactId} not found`);

    const rules = await this.ruleRepo.find({
      where: { workspaceId, channel: channel as PersonalizationRuleEntity['channel'], isActive: true },
      order: { priority: 'DESC' },
    });

    const matchedRules: Array<{ ruleId: string; name: string; contentVariant: Record<string, string> }> = [];

    for (const rule of rules) {
      const matches = this.evaluateRule(rule, profile);
      if (matches) {
        matchedRules.push({
          ruleId: rule.id,
          name: rule.name,
          contentVariant: rule.contentVariant ?? {},
        });
        rule.impressions++;
        await this.ruleRepo.save(rule);
      }
    }

    return {
      profileId: profile.id,
      segment: profile.segment ?? 'unknown',
      matchedRules,
    };
  }

  async getSegmentRecommendations(workspaceId: string): Promise<Array<{
    segment: string; contactCount: number; avgEngagement: number; topInterests: string[];
  }>> {
    const profiles = await this.profileRepo.find({ where: { workspaceId } });
    const segmentMap: Record<string, { contacts: number; engagement: number; interests: Record<string, number> }> = {};

    for (const profile of profiles) {
      const segment = profile.segment ?? 'unassigned';
      if (!segmentMap[segment]) {
        segmentMap[segment] = { contacts: 0, engagement: 0, interests: {} };
      }
      segmentMap[segment].contacts++;
      segmentMap[segment].engagement += profile.engagementScore;

      if (profile.interests) {
        for (const interest of profile.interests) {
          segmentMap[segment].interests[interest] = (segmentMap[segment].interests[interest] ?? 0) + 1;
        }
      }
    }

    return Object.entries(segmentMap).map(([segment, data]) => ({
      segment,
      contactCount: data.contacts,
      avgEngagement: data.contacts > 0 ? Math.round((data.engagement / data.contacts) * 10) / 10 : 0,
      topInterests: Object.entries(data.interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([interest]) => interest),
    }));
  }

  async calculateEngagementScore(workspaceId: string, contactId: string): Promise<number> {
    const events = await this.eventRepo.find({
      where: { workspaceId, contactId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    if (events.length === 0) return 0;

    const now = Date.now();
    let score = 0;

    for (const event of events) {
      const ageHours = (now - new Date(event.createdAt).getTime()) / (1000 * 60 * 60);
      const recencyMultiplier = Math.max(0.1, 1 - ageHours / (24 * 30));

      const eventWeights: Record<string, number> = {
        [EventType.PURCHASE]: 10,
        [EventType.FORM_SUBMIT]: 5,
        [EventType.CLICK]: 2,
        [EventType.PAGE_VIEW]: 1,
        [EventType.EMAIL_OPEN]: 3,
        [EventType.CUSTOM]: 2,
      };

      score += (eventWeights[event.eventType] ?? 1) * recencyMultiplier;
    }

    return Math.min(100, Math.round(score * 10) / 10);
  }

  private evaluateRule(rule: PersonalizationRuleEntity, profile: PersonalizationProfileEntity): boolean {
    const fieldValue = (profile as unknown as Record<string, unknown>)[rule.targetField];
    if (fieldValue === undefined || fieldValue === null) return false;

    const stringValue = String(fieldValue);
    switch (rule.operator) {
      case RuleOperator.EQUALS:
        return stringValue === rule.value;
      case RuleOperator.CONTAINS:
        return stringValue.includes(rule.value);
      case RuleOperator.GREATER_THAN:
        return Number(fieldValue) > Number(rule.value);
      case RuleOperator.LESS_THAN:
        return Number(fieldValue) < Number(rule.value);
      case RuleOperator.IN:
        return rule.value.split(',').includes(stringValue);
      case RuleOperator.NOT_IN:
        return !rule.value.split(',').includes(stringValue);
      default:
        return false;
    }
  }
}
