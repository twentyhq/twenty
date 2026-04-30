import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntryEntity, BadgeEntity, SalesChallengeEntity, BadgeType } from './gamification.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(LeaderboardEntryEntity) private readonly leaderboardRepo: Repository<LeaderboardEntryEntity>,
    @InjectRepository(BadgeEntity) private readonly badgeRepo: Repository<BadgeEntity>,
    @InjectRepository(SalesChallengeEntity) private readonly challengeRepo: Repository<SalesChallengeEntity>,
  ) {}

  async recordActivity(
    workspaceId: string,
    userId: string,
    period: string,
    data: { dealsWon?: number; revenue?: number; activitiesCompleted?: number; points?: number },
  ): Promise<LeaderboardEntryEntity> {
    let entry = await this.leaderboardRepo.findOne({ where: { workspaceId, userId, period } });
    if (!entry) {
      entry = this.leaderboardRepo.create({ workspaceId, userId, period });
    }
    if (data.dealsWon) entry.dealsWon += data.dealsWon;
    if (data.revenue) entry.revenue = Number(entry.revenue) + data.revenue;
    if (data.activitiesCompleted) entry.activitiesCompleted += data.activitiesCompleted;
    if (data.points) entry.points += data.points;
    return this.leaderboardRepo.save(entry);
  }

  async getLeaderboard(workspaceId: string, period: string): Promise<LeaderboardEntryEntity[]> {
    const entries = await this.leaderboardRepo.find({
      where: { workspaceId, period },
      order: { points: 'DESC' },
    });
    return entries.map((e, i) => { e.rank = i + 1; return e; });
  }

  async awardBadge(workspaceId: string, userId: string, type: BadgeType, name: string, description?: string): Promise<BadgeEntity> {
    const existing = await this.badgeRepo.findOne({ where: { workspaceId, userId, name } });
    if (existing) return existing;
    return this.badgeRepo.save(this.badgeRepo.create({ workspaceId, userId, type, name, description }));
  }

  async getUserBadges(workspaceId: string, userId: string): Promise<BadgeEntity[]> {
    return this.badgeRepo.find({ where: { workspaceId, userId }, order: { earnedAt: 'DESC' } });
  }

  async checkAndAwardBadges(workspaceId: string, userId: string, period: string): Promise<BadgeEntity[]> {
    const entry = await this.leaderboardRepo.findOne({ where: { workspaceId, userId, period } });
    if (!entry) return [];

    const awarded: BadgeEntity[] = [];
    const thresholds: Array<{ check: boolean; type: BadgeType; name: string }> = [
      { check: entry.dealsWon >= 5, type: BadgeType.DEALS_WON, name: 'Closer 5' },
      { check: entry.dealsWon >= 20, type: BadgeType.DEALS_WON, name: 'Closer 20' },
      { check: Number(entry.revenue) >= 100_000_000, type: BadgeType.REVENUE_MILESTONE, name: '100M Revenue' },
      { check: Number(entry.quotaAttainment) >= 100, type: BadgeType.STREAK, name: 'Quota Crusher' },
    ];

    for (const t of thresholds) {
      if (t.check) {
        awarded.push(await this.awardBadge(workspaceId, userId, t.type, t.name));
      }
    }

    return awarded;
  }

  async createChallenge(workspaceId: string, data: Partial<SalesChallengeEntity>): Promise<SalesChallengeEntity> {
    return this.challengeRepo.save(this.challengeRepo.create({ workspaceId, ...data }));
  }

  async getActiveChallenges(workspaceId: string): Promise<SalesChallengeEntity[]> {
    return this.challengeRepo.find({ where: { workspaceId, isActive: true } });
  }
}
