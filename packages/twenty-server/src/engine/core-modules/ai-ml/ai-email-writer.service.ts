import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  constructor(
    @InjectRepository(AIEmailWriterEntity)
    private readonly writerRepo: Repository<AIEmailWriterEntity>,
    @InjectRepository(EmailGenerationLogEntity)
    private readonly logRepo: Repository<EmailGenerationLogEntity>,
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

    const templatePrompt = TEMPLATE_PROMPTS[templateType];
    const toneModifier = TONE_MODIFIERS[tone];

    let prompt = `${templatePrompt}. ${toneModifier}. Keep it under ${maxLength} words.`;
    
    if (options.contactName) {
      prompt += `\n\nRecipient: ${options.contactName}`;
    }
    if (options.contactCompany) {
      prompt += `\nCompany: ${options.contactCompany}`;
    }
    prompt += `\n\nContext: ${options.context}`;

    const generatedEmail = await this.generateWithAI(prompt, options.variables);
    const subject = this.generateSubject(templateType, options.contactName);

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

  private async generateWithAI(prompt: string, variables?: Record<string, string>): Promise<string> {
    let emailBody = `Thank you for your interest in learning more about our solutions.`;
    
    if (prompt.includes('cold')) {
      emailBody = `I hope this email finds you well. I wanted to reach out because I believe our platform could significantly benefit ${variables?.['companyName'] || 'your team'}.`;
    } else if (prompt.includes('follow')) {
      emailBody = `I wanted to follow up on my previous email and see if you had a chance to review the information I shared.`;
    } else if (prompt.includes('meeting')) {
      emailBody = `I would love to schedule a brief call to discuss how we can help you achieve your goals. Would you have 15-20 minutes available this week or next?`;
    }

    if (prompt.includes('professional')) {
      emailBody = emailBody.replace(/I wanted to/gi, 'I am reaching out to');
    } else if (prompt.includes('friendly')) {
      emailBody = emailBody.replace(/I am reaching out/gi, "I'd love to connect");
    }

    return emailBody;
  }

  private generateSubject(templateType: EmailTemplateType, contactName?: string): string {
    const name = contactName ? ` ${contactName}` : '';
    switch (templateType) {
      case EmailTemplateType.COLD_OUTREACH:
        return `Quick question${name}`;
      case EmailTemplateType.FOLLOW_UP:
        return `Following up${name}`;
      case EmailTemplateType.MEETING_REQUEST:
        return `Meeting request${name}`;
      case EmailTemplateType.PRODUCT_UPDATE:
        return `Exciting updates for you`;
      case EmailTemplateType.CASE_STUDY:
        return `How [Company] achieved results`;
      default:
        return `Information${name}`;
    }
  }
}