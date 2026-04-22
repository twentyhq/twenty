import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';

import { SentimentAnalysisEntity, SentimentAggregateEntity, SentimentLabel } from './sentiment-analysis.entity';

@Injectable()
export class SentimentAnalysisService {
  constructor(
    @InjectRepository(SentimentAnalysisEntity)
    private readonly sentimentRepo: Repository<SentimentAnalysisEntity>,
    @InjectRepository(SentimentAggregateEntity)
    private readonly aggregateRepo: Repository<SentimentAggregateEntity>,
  ) {}

  async analyze(
    workspaceId: string,
    content: string,
    recordId?: string,
    recordType?: string,
  ): Promise<SentimentAnalysisEntity> {
    const analysis = this.performAnalysis(content);

    const entity = this.sentimentRepo.create({
      workspaceId,
      recordId,
      recordType,
      content: content.substring(0, 5000),
      ...analysis,
    });

    return this.sentimentRepo.save(entity);
  }

  async analyzeBatch(
    workspaceId: string,
    items: Array<{ content: string; recordId?: string; recordType?: string }>,
  ): Promise<SentimentAnalysisEntity[]> {
    const entities = items.map(item => {
      const analysis = this.performAnalysis(item.content);
      return this.sentimentRepo.create({
        workspaceId,
        recordId: item.recordId,
        recordType: item.recordType,
        content: item.content.substring(0, 5000),
        ...analysis,
      });
    });

    return this.sentimentRepo.save(entities);
  }

  async getHistory(
    workspaceId: string,
    recordId?: string,
    limit = 50,
  ): Promise<SentimentAnalysisEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (recordId) where.recordId = recordId;

    return this.sentimentRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getAggregates(workspaceId: string, period = 'day'): Promise<SentimentAggregateEntity[]> {
    return this.aggregateRepo.find({
      where: { workspaceId, period },
      order: { computedAt: 'DESC' },
      take: 30,
    });
  }

  async computeAggregates(workspaceId: string, period = 'day'): Promise<SentimentAggregateEntity> {
    const since = this.getPeriodStart(period);
    const records = await this.sentimentRepo.find({
      where: { workspaceId, createdAt: MoreThan(since) },
    });

    const total = records.length;
    const positive = records.filter(r => r.sentiment === SentimentLabel.POSITIVE).length;
    const negative = records.filter(r => r.sentiment === SentimentLabel.NEGATIVE).length;
    const neutral = records.filter(r => r.sentiment === SentimentLabel.NEUTRAL).length;

    const aggregate = this.aggregateRepo.create({
      workspaceId,
      period,
      totalAnalyzed: total,
      averageScore: total > 0 ? records.reduce((sum, r) => sum + r.confidence, 0) / total : 0,
      positiveCount: positive,
      negativeCount: negative,
      neutralCount: neutral,
    });

    return this.aggregateRepo.save(aggregate);
  }

  private performAnalysis(content: string): {
    sentiment: SentimentLabel;
    confidence: number;
    positiveScore: number;
    negativeScore: number;
    neutralScore: number;
    emotions: Record<string, number>;
    keyPhrases: string[];
  } {
    const lower = content.toLowerCase();
    const words = lower.split(/\s+/);
    
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic', 'happy', 'pleased', 'good', 'best', 'awesome', 'perfect', 'thank', 'thanks', 'appreciate', 'helpful', 'recommend'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'worst', 'poor', 'issue', 'problem', 'difficult', 'angry', 'annoyed', 'unfortunately', 'failed', 'error'];
    const neutralWords = ['okay', 'fine', 'maybe', 'perhaps', 'consider', 'might', 'could'];

    let posScore = 0;
    let negScore = 0;
    let neuScore = 0;

    for (const word of words) {
      if (positiveWords.some(pw => word.includes(pw))) posScore++;
      else if (negativeWords.some(nw => word.includes(nw))) negScore++;
      else if (neutralWords.some(nw => word.includes(nw))) neuScore++;
    }

    const total = posScore + negScore + neuScore || 1;
    const posNorm = posScore / total;
    const negNorm = negScore / total;
    const neuNorm = neuScore / total;

    let sentiment: SentimentLabel;
    if (posScore > negScore && posScore > neuScore) {
      sentiment = SentimentLabel.POSITIVE;
    } else if (negScore > posScore && negScore > neuScore) {
      sentiment = SentimentLabel.NEGATIVE;
    } else {
      sentiment = SentimentLabel.NEUTRAL;
    }

    const confidence = Math.max(posNorm, negNorm, neuNorm);

    const emotions: Record<string, number> = {
      joy: posScore > 0 ? Math.min(posNorm * 1.5, 1) : 0,
      anger: negScore > 0 ? Math.min(negNorm * 1.2, 1) : 0,
      sadness: negScore > 1 ? Math.min(negNorm * 0.8, 0.5) : 0,
      surprise: (posScore + negScore) > 0 ? Math.min((posNorm + negNorm) * 0.3, 0.4) : 0,
    };

    const keyPhrases = this.extractKeyPhrases(content);

    return {
      sentiment,
      confidence,
      positiveScore: posNorm,
      negativeScore: negNorm,
      neutralScore: neuNorm,
      emotions,
      keyPhrases,
    };
  }

  private extractKeyPhrases(content: string): string[] {
    const phrases: string[] = [];
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences.slice(0, 3)) {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 3 && words.length <= 8) {
        phrases.push(sentence.trim().substring(0, 100));
      }
    }

    return phrases.slice(0, 5);
  }

  private getPeriodStart(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }
}