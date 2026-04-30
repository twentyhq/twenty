import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AIGovernanceService } from '../ai-governance/ai-governance.service';

import {
  AIEmailWriterEntity,
  EmailGenerationLogEntity,
  EmailTemplateType,
  EmailTone,
  EmailWriterStatus,
} from './ai-email-writer.entity';

const TEMPLATE_PROMPTS: Record<EmailTemplateType, string> = {
  [EmailTemplateType.COLD_OUTREACH]: 'Write a cold outreach email that introduces our solution and creates curiosity',
  [EmailTemplateType.FOLLOW_UP]: 'Write a follow-up email that is polite and reminds the recipient of previous communication',
  [EmailTemplateType.MEETING_REQUEST]: 'Write a concise meeting request email with a clear purpose and suggested times',
  [EmailTemplateType.PRODUCT_UPDATE]: 'Write an email about our latest product features and their benefits',
  [EmailTemplateType.CASE_STUDY]: 'Write an email highlighting a success story relevant to the recipient',
  [EmailTemplateType.CUSTOM]: 'Write a professional email based on the context provided',
};

const TONE_MODIFIERS: Record<EmailTone, string> = {
  [EmailTone.PROFESSIONAL]: 'Use a professional, business-appropriate tone',
  [EmailTone.FRIENDLY]: 'Use a warm, friendly tone while remaining professional',
  [EmailTone.CASUAL]: 'Use a casual, conversational tone',
  [EmailTone.FORMAL]: 'Use a formal, traditional business tone',
  [EmailTone.PERSUASIVE]: 'Use a compelling, persuasive tone that drives action',
};

@Injectable()
export class AIEmailWriterService {
  private readonly logger = new Logger(AIEmailWriterService.name);

  constructor(
    @InjectRepository(AIEmailWriterEntity)
    private readonly writerRepo: Repository<AIEmailWriterEntity>,
    @InjectRepository(EmailGenerationLogEntity)
    private readonly logRepo: Repository<EmailGenerationLogEntity>,
    private readonly aiGovernance: AIGovernanceService,
  ) {}

  async getWriterConfig(workspaceId: string, userId: string): Promise<AIEmailWriterEntity> {
    let config = await this.writerRepo.findOne({ where: { workspaceId, userId } });
    if (!config) {
      config = this.writerRepo.create({
        workspaceId,
        userId,
        status: EmailWriterStatus.ACTIVE,
      });
      config = await this.writerRepo.save(config);
    }
    return config;
  }

  async updateConfig(
    workspaceId: string,
    userId: string,
    updates: Partial<AIEmailWriterEntity>,
  ): Promise<AIEmailWriterEntity> {
    const config = await this.getWriterConfig(workspaceId, userId);
    Object.assign(config, updates);
    return this.writerRepo.save(config);
  }

  async generateEmail(
    workspaceId: string,
    userId: string,
    options: {
      context: string;
      contactName?: string;
      contactCompany?: string;
      templateType?: EmailTemplateType;
      tone?: EmailTone;
      maxLength?: number;
      variables?: Record<string, string>;
    },
  ): Promise<{ email: string; subject: string; logId: string }> {
    const config = await this.getWriterConfig(workspaceId, userId);

    const templateType = options.templateType || config.templateType;
    const tone = options.tone || config.tone;
    const maxLength = options.maxLength || config.maxLength;

    const prompt = this.buildPrompt({
      templateType,
      tone,
      maxLength,
      context: options.context,
      contactName: options.contactName,
      contactCompany: options.contactCompany,
      variables: options.variables,
      includeSignature: config.includeSignature,
      includeCallToAction: config.includeCallToAction,
    });

    const generatedEmail = await this.generateWithAI(prompt, workspaceId, userId);
    const subject = this.generateSubject(templateType, options.contactName, options.contactCompany, options.context);

    const logEntry = this.logRepo.create({
      workspaceId,
      userId,
      prompt,
      generatedEmail,
      subject,
      templateType,
      tone,
    });
    await this.logRepo.save(logEntry);

    config.emailsGenerated += 1;
    await this.writerRepo.save(config);

    return { email: generatedEmail, subject, logId: logEntry.id };
  }

  async getGenerationSummary(workspaceId: string, userId: string): Promise<{
    emailsGenerated: number;
    averageRating: number;
    activeTemplateType: EmailTemplateType;
    activeTone: EmailTone;
    latestSubject: string | null;
  }> {
    const config = await this.getWriterConfig(workspaceId, userId);
    const latest = await this.logRepo.findOne({
      where: { workspaceId, userId },
      order: { createdAt: 'DESC' },
    });

    return {
      emailsGenerated: config.emailsGenerated ?? 0,
      averageRating: Number((config.averageRating ?? 0).toFixed(2)),
      activeTemplateType: config.templateType,
      activeTone: config.tone,
      latestSubject: latest?.subject ?? null,
    };
  }

  async getGenerationHistory(
    workspaceId: string,
    userId: string,
    limit = 20,
  ): Promise<EmailGenerationLogEntity[]> {
    return this.logRepo.find({
      where: { workspaceId, userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async rateEmail(logId: string, rating: number): Promise<void> {
    const log = await this.logRepo.findOne({ where: { id: logId } });
    if (!log) {
      throw new NotFoundException('Log entry not found');
    }

    log.rating = rating;
    await this.logRepo.save(log);

    const writer = await this.writerRepo.findOne({
      where: { workspaceId: log.workspaceId, userId: log.userId },
    });
    if (writer) {
      const logs = await this.logRepo.find({
        where: { workspaceId: log.workspaceId, userId: log.userId },
      });
      const ratedLogs = logs.filter(l => l.rating != null);
      if (ratedLogs.length > 0) {
        writer.averageRating = ratedLogs.reduce((sum, l) => sum + l.rating, 0) / ratedLogs.length;
        await this.writerRepo.save(writer);
      }
    }
  }

  async markAsUsed(logId: string): Promise<void> {
    await this.logRepo.update(logId, { used: true });
  }

  private async generateWithAI(prompt: string, workspaceId?: string, userId?: string): Promise<string> {
    // Try LLM-powered generation first
    if (workspaceId && userId) {
      try {
        const response = await this.aiGovernance.callLLM(workspaceId, userId, {
          feature: 'ai-email-writer',
          messages: [
            {
              role: 'system',
              content: 'You are a professional sales email writer. Write concise, effective emails. Return only the email body text, no subject line.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          maxTokens: 1024,
        });

        return response.content;
      } catch (error) {
        this.logger.warn(
          `LLM email generation failed, falling back to template: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }

    // Fallback to template-based generation
    const parsed = this.parsePrompt(prompt);
    const recipient = parsed.contactName ?? 'there';
    const company = parsed.contactCompany ?? parsed.variables.companyName ?? 'your team';

    const opener = this.buildOpener(parsed.templateType, parsed.tone, recipient, company, parsed.context);
    const valueProp = this.buildValueProp(parsed.templateType, company, parsed.context, parsed.variables);
    const cta = this.buildCallToAction(parsed.templateType, parsed.includeCallToAction, recipient);
    const signature = parsed.includeSignature ? this.buildSignature(parsed.variables) : '';

    const body = [opener, valueProp, cta, signature].filter(Boolean).join('\n\n');
    return this.limitWords(body, parsed.maxLength);
  }

  private generateSubject(
    templateType: EmailTemplateType,
    contactName?: string,
    contactCompany?: string,
    context?: string,
  ): string {
    const name = contactName ? ` ${contactName}` : '';
    const company = contactCompany ? ` at ${contactCompany}` : '';
    const contextHint = context && context.length < 30 ? ` - ${context}` : '';
    switch (templateType) {
      case EmailTemplateType.COLD_OUTREACH:
        return `Quick question${name}${company}${contextHint}`;
      case EmailTemplateType.FOLLOW_UP:
        return `Following up${name}${company}${contextHint}`;
      case EmailTemplateType.MEETING_REQUEST:
        return `Meeting request${name}${company}`;
      case EmailTemplateType.PRODUCT_UPDATE:
        return `Exciting updates for${company || ' you'}`;
      case EmailTemplateType.CASE_STUDY:
        return `How ${contactCompany || 'similar teams'} achieved results`;
      default:
        return `Information${name}${company}`;
    }
  }

  private buildPrompt(input: {
    templateType: EmailTemplateType;
    tone: EmailTone;
    maxLength: number;
    context: string;
    contactName?: string;
    contactCompany?: string;
    variables?: Record<string, string>;
    includeSignature: boolean;
    includeCallToAction: boolean;
  }): string {
    const parts = [
      TEMPLATE_PROMPTS[input.templateType],
      TONE_MODIFIERS[input.tone],
      `Keep it under ${input.maxLength} words.`,
      input.contactName ? `Recipient: ${input.contactName}` : null,
      input.contactCompany ? `Company: ${input.contactCompany}` : null,
      input.context ? `Context: ${input.context}` : null,
      input.variables ? `Variables: ${JSON.stringify(input.variables)}` : null,
      input.includeSignature ? 'Include signature.' : 'No signature.',
      input.includeCallToAction ? 'Include a clear CTA.' : 'No CTA.',
    ].filter((part): part is string => Boolean(part));

    return parts.join('\n');
  }

  private parsePrompt(prompt: string): {
    templateType: EmailTemplateType;
    tone: EmailTone;
    maxLength: number;
    context: string;
    contactName?: string;
    contactCompany?: string;
    variables: Record<string, string>;
    includeSignature: boolean;
    includeCallToAction: boolean;
  } {
    const lines = prompt.split('\n').map((line) => line.trim()).filter(Boolean);
    const getValue = (prefix: string): string | undefined => {
      const line = lines.find((entry) => entry.startsWith(prefix));
      return line ? line.slice(prefix.length).trim() : undefined;
    };

    const context = getValue('Context: ') ?? '';
    const variablesRaw = getValue('Variables: ') ?? '{}';
    let variables: Record<string, string> = {};
    try {
      variables = JSON.parse(variablesRaw) as Record<string, string>;
    } catch {
      variables = {};
    }

    const templateType = this.parseEnumValue(
      lines.join(' '),
      Object.values(EmailTemplateType),
      EmailTemplateType.CUSTOM,
    );
    const tone = this.parseEnumValue(
      lines.join(' '),
      Object.values(EmailTone),
      EmailTone.PROFESSIONAL,
    );
    const maxLength = Number((lines.find((line) => line.includes('Keep it under')) ?? '').match(/(\d+)/)?.[1] ?? 150);

    return {
      templateType,
      tone,
      maxLength,
      context,
      contactName: getValue('Recipient: '),
      contactCompany: getValue('Company: '),
      variables,
      includeSignature: lines.some((line) => line.includes('Include signature.')),
      includeCallToAction: lines.some((line) => line.includes('Include a clear CTA.')),
    };
  }

  private buildOpener(
    templateType: EmailTemplateType,
    tone: EmailTone,
    recipient: string,
    company: string,
    context: string,
  ): string {
    const tonePrefix = tone === EmailTone.FORMAL
      ? 'I hope you are doing well.'
      : tone === EmailTone.FRIENDLY
        ? 'Hope you are well.'
        : tone === EmailTone.CASUAL
          ? 'Hope all is good.'
          : 'I hope this finds you well.';

    switch (templateType) {
      case EmailTemplateType.COLD_OUTREACH:
        return `${tonePrefix} I am reaching out because I believe ${company} could benefit from a focused conversation about ${this.shortContext(context)}.`;
      case EmailTemplateType.FOLLOW_UP:
        return `Following up on my previous note to ${recipient}, I wanted to revisit the most relevant points for ${company}.`;
      case EmailTemplateType.MEETING_REQUEST:
        return `I would like to schedule a short meeting with ${recipient} to align on ${this.shortContext(context)}.`;
      case EmailTemplateType.PRODUCT_UPDATE:
        return `I wanted to share a concise update that may be useful for ${company}.`;
      case EmailTemplateType.CASE_STUDY:
        return `I wanted to share a similar customer story that may be relevant to ${company}.`;
      default:
        return `${tonePrefix} I am sharing a quick update relevant to ${company}.`;
    }
  }

  private buildValueProp(
    templateType: EmailTemplateType,
    company: string,
    context: string,
    variables: Record<string, string>,
  ): string {
    const details = this.shortContext(context);
    const companyName = variables.companyName || company;

    switch (templateType) {
      case EmailTemplateType.COLD_OUTREACH:
        return `Teams like ${companyName} usually see value when they reduce manual work, speed up follow-up, and improve visibility across the pipeline.`;
      case EmailTemplateType.FOLLOW_UP:
        return `The main reason I am following up is to make sure the opportunity stays aligned with the current priorities around ${details}.`;
      case EmailTemplateType.MEETING_REQUEST:
        return `A short call would let us compare your current setup with a more streamlined approach and identify the highest-impact next step.`;
      case EmailTemplateType.PRODUCT_UPDATE:
        return `The update is designed to help with ${details || 'execution efficiency'} and create a cleaner handoff for the team.`;
      case EmailTemplateType.CASE_STUDY:
        return `In a similar scenario, the customer improved execution speed and reduced friction by focusing on a few core workflow changes.`;
      default:
        return `The note is centered on ${details || 'the main business need'} and the concrete outcome the team wants to achieve.`;
    }
  }

  private buildCallToAction(templateType: EmailTemplateType, includeCTA: boolean, recipient: string): string {
    if (!includeCTA) return '';

    switch (templateType) {
      case EmailTemplateType.MEETING_REQUEST:
        return `Would you be open to a 20-minute call next week, ${recipient}?`;
      case EmailTemplateType.FOLLOW_UP:
        return `If it makes sense, I can send a one-page recap or walk through any open questions.`;
      case EmailTemplateType.CASE_STUDY:
        return `If useful, I can share the full case study or a brief breakdown of the approach.`;
      default:
        return `If this is relevant, I can send more detail or set up a quick discussion.`;
    }
  }

  private buildSignature(variables: Record<string, string>): string {
    const sender = variables.senderName || 'Twenty';
    const title = variables.senderTitle ? `\n${variables.senderTitle}` : '';
    return `Best,\n${sender}${title}`;
  }

  private shortContext(context: string): string {
    const trimmed = context.trim();
    if (!trimmed) return 'your current priorities';
    return trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed;
  }

  private limitWords(text: string, maxLength: number): string {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxLength) return text;
    return `${words.slice(0, maxLength).join(' ')}...`;
  }

  private parseEnumValue<T extends string>(text: string, candidates: T[], fallback: T): T {
    const found = candidates.find((candidate) => text.includes(candidate));
    return (found ?? fallback) as T;
  }
}
