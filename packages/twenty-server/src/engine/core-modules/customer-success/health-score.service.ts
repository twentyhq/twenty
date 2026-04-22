import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerHealthEntity, NPSSurveyEntity, HealthStatus } from './health-score.entity';

@Injectable()
export class CustomerSuccessService {
  constructor(
    @InjectRepository(CustomerHealthEntity)
    private readonly healthRepo: Repository<CustomerHealthEntity>,
    @InjectRepository(NPSSurveyEntity)
    private readonly npsRepo: Repository<NPSSurveyEntity>,
  ) {}

  async computeHealth(workspaceId: string, accountId: string, metrics: Record<string, number>): Promise<CustomerHealthEntity> {
    let score = 100;
    const risks: string[] = [];

    if (metrics.supportTickets > 10) { score -= 20; risks.push('High support tickets'); }
    if (metrics.loginFrequency < 2) { score -= 15; risks.push('Low engagement'); }
    if (metrics.npsScore && metrics.npsScore < 5) { score -= 25; risks.push('Low NPS'); }
    if (metrics.paymentFailed) { score -= 30; risks.push('Payment issues'); }
    if (metrics.contractRenewal < 30) { score -= 20; risks.push('Upcoming renewal'); }

    let status = HealthStatus.HEALTHY;
    if (score < 40) status = HealthStatus.CRITICAL;
    else if (score < 70) status = HealthStatus.AT_RISK;

    const health = this.healthRepo.create({
      workspaceId,
      accountId,
      healthScore: score,
      status,
      metrics,
      riskFactors: risks,
      recommendations: this.generateRecommendations(status),
    });

    return this.healthRepo.save(health);
  }

  async getHealth(workspaceId: string, accountId: string): Promise<CustomerHealthEntity | null> {
    return this.healthRepo.findOne({ where: { workspaceId, accountId } });
  }

  async sendNPS(workspaceId: string, accountId: string): Promise<NPSSurveyEntity> {
    const survey = this.npsRepo.create({ workspaceId, accountId, score: 0, responded: false });
    return this.npsRepo.save(survey);
  }

  async recordNPS(id: string, score: number, feedback?: string): Promise<NPSSurveyEntity> {
    await this.npsRepo.update(id, { score, feedback, responded: true });
    return this.npsRepo.findOne({ where: { id } });
  }

  private generateRecommendations(status: HealthStatus): string[] {
    switch (status) {
      case HealthStatus.CRITICAL:
        return ['Schedule executive review', 'Assign dedicated CSM', 'Offer incentives'];
      case HealthStatus.AT_RISK:
        return ['Schedule check-in call', 'Share success stories', 'Review product usage'];
      default:
        return ['Continue engagement', 'Identify expansion opportunities'];
    }
  }
}