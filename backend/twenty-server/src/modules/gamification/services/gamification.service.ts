import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BadgeWorkspaceEntity, BadgeAwardWorkspaceEntity } from 'src/modules/gamification/standard-objects/badge.workspace-entity';
import { GoalWorkspaceEntity } from 'src/modules/gamification/standard-objects/goal.workspace-entity';
import { UserPointsWorkspaceEntity } from 'src/modules/gamification/standard-objects/user-points.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  level: number;
  levelName: string;
  dealsWon: number;
  revenue: number;
  badges: number;
  streakDays: number;
}

export interface Achievement {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  earned: boolean;
  progress: number;
  requirement: number;
  progressPercentage: number;
  pointsAwarded: number;
  earnedAt?: Date;
}

export interface CreateBadgeDto {
  name: string;
  description: string;
  icon?: string;
  type: BadgeType;
  criteria: string;
  points: number;
  isActive?: boolean;
}

export interface CreateGoalDto {
  name: string;
  description?: string;
  targetValue: number;
  startDate?: Date;
  endDate: Date;
  type: string;
  metric?: string;
  ownerId: string;
}

export interface UserStats {
  userId: string;
  dealsWon: number;
  dealsCreated: number;
  revenue: number;
  ticketsResolved: number;
  callsMade: number;
  emailsSent: number;
  meetingsBooked: number;
  tasksCompleted: number;
  lastActivityDate: Date;
  streakDays: number;
}

export enum BadgeType {
  DEALS_WON = 'DEALS_WON',
  REVENUE = 'REVENUE',
  DEALS_CREATED = 'DEALS_CREATED',
  TICKETS_RESOLVED = 'TICKETS_RESOLVED',
  CALLS_MADE = 'CALLS_MADE',
  EMAILS_SENT = 'EMAILS_SENT',
  MEETINGS_BOOKED = 'MEETINGS_BOOKED',
  TASKS_COMPLETED = 'TASKS_COMPLETED',
  STREAK_DAYS = 'STREAK_DAYS',
  LEVEL_MILESTONE = 'LEVEL_MILESTONE',
  TEAM_PLAYER = 'TEAM_PLAYER',
  EARLY_BIRD = 'EARLY_BIRD',
  NIGHT_OWL = 'NIGHT_OWL',
  PERFECT_MONTH = 'PERFECT_MONTH',
  QUICK_RESPONDER = 'QUICK_RESPONDER',
}

export interface NotificationPayload {
  userId: string;
  type: 'BADGE_EARNED' | 'LEVEL_UP' | 'STREAK_MILESTONE' | 'GOAL_COMPLETED';
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);
  private readonly levelThresholds = [0, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  private readonly levelNames = [
    'Newcomer', 'Rookie', 'Apprentice', 'Professional', 'Expert',
    'Master', 'Senior Master', 'Grand Master', 'Legend', 'Mythic', 'Immortal'
  ];

  constructor(
    @InjectRepository(BadgeWorkspaceEntity)
    private readonly badgeRepository: Repository<BadgeWorkspaceEntity>,
    @InjectRepository(BadgeAwardWorkspaceEntity)
    private readonly badgeAwardRepository: Repository<BadgeAwardWorkspaceEntity>,
    @InjectRepository(GoalWorkspaceEntity)
    private readonly goalRepository: Repository<GoalWorkspaceEntity>,
    @InjectRepository(UserPointsWorkspaceEntity)
    private readonly userPointsRepository: Repository<UserPointsWorkspaceEntity>,
    @InjectRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: Repository<WorkspaceMemberWorkspaceEntity>,
  ) {}

  async initializeUserPoints(userId: string): Promise<UserPointsWorkspaceEntity> {
    this.logger.log(`Initializing points for user: ${userId}`);

    const existingUserPoints = await this.userPointsRepository.findOne({
      where: { userId },
    });

    if (existingUserPoints) {
      return existingUserPoints;
    }

    const userPoints = this.userPointsRepository.create({
      userId,
      totalPoints: 0,
      currentLevel: 0,
      levelName: this.levelNames[0],
      badgesEarned: 0,
      dealsWon: 0,
      revenueGenerated: 0,
      streakDays: 0,
      lastActivityDate: new Date(),
    });

    return await this.userPointsRepository.save(userPoints);
  }

  async calculateLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    this.logger.log('Calculating leaderboard');

    const userPoints = await this.userPointsRepository.find({
      order: { totalPoints: 'DESC' },
      take: limit,
      relations: ['user'],
    });

    return userPoints.map((userPoint, index) => ({
      rank: index + 1,
      userId: userPoint.userId,
      userName: userPoint.user?.name || 'Unknown',
      points: userPoint.totalPoints,
      level: userPoint.currentLevel,
      levelName: userPoint.levelName,
      dealsWon: userPoint.dealsWon,
      revenue: userPoint.revenueGenerated,
      badges: userPoint.badgesEarned,
      streakDays: userPoint.streakDays,
    }));
  }

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserPointsWorkspaceEntity> {
    this.logger.log(`Updating stats for user: ${userId}`);

    let userPoints = await this.userPointsRepository.findOne({
      where: { userId },
    });

    if (!userPoints) {
      userPoints = await this.initializeUserPoints(userId);
    }

    // Update stats
    if (stats.dealsWon !== undefined) userPoints.dealsWon = stats.dealsWon;
    if (stats.revenue !== undefined) userPoints.revenueGenerated = stats.revenue;
    if (stats.lastActivityDate) userPoints.lastActivityDate = stats.lastActivityDate;
    if (stats.streakDays !== undefined) userPoints.streakDays = stats.streakDays;

    // Calculate new points and level
    const totalPoints = this.calculateTotalPoints(userPoints);
    const newLevel = this.calculateLevel(totalPoints);
    const levelName = this.levelNames[newLevel];

    // Check for level up
    if (newLevel > userPoints.currentLevel) {
      await this.sendNotification(userId, 'LEVEL_UP', 'Level Up!', `You've reached ${levelName}!`, {
        oldLevel: userPoints.currentLevel,
        newLevel,
        levelName,
      });
      this.logger.log(`User ${userId} leveled up to ${levelName}`);
    }

    userPoints.totalPoints = totalPoints;
    userPoints.currentLevel = newLevel;
    userPoints.levelName = levelName;

    return await this.userPointsRepository.save(userPoints);
  }

  async checkAchievements(userId: string, userStats: UserStats): Promise<Achievement[]> {
    this.logger.log(`Checking achievements for user: ${userId}`);

    const badges = await this.badgeRepository.find({
      where: { isActive: true },
    });

    const achievements: Achievement[] = [];
    const userPoints = await this.initializeUserPoints(userId);

    for (const badge of badges) {
      const achievement = await this.evaluateBadge(badge, userStats, userId);
      achievements.push(achievement);

      // Award badge if newly earned
      if (achievement.earned && !achievement.earnedAt) {
        await this.awardBadge(userId, badge.id, achievement.pointsAwarded);
      }
    }

    return achievements;
  }

  private async evaluateBadge(badge: BadgeWorkspaceEntity, userStats: UserStats, userId: string): Promise<Achievement> {
    let progress = 0;
    let requirement = 0;
    let earned = false;
    let earnedAt: Date | undefined;

    switch (badge.type) {
      case BadgeType.DEALS_WON:
        requirement = parseInt(badge.criteria) || 10;
        progress = userStats.dealsWon;
        break;
      case BadgeType.REVENUE:
        requirement = parseFloat(badge.criteria) || 1000000;
        progress = userStats.revenue;
        break;
      case BadgeType.DEALS_CREATED:
        requirement = parseInt(badge.criteria) || 20;
        progress = userStats.dealsCreated;
        break;
      case BadgeType.TICKETS_RESOLVED:
        requirement = parseInt(badge.criteria) || 50;
        progress = userStats.ticketsResolved;
        break;
      case BadgeType.CALLS_MADE:
        requirement = parseInt(badge.criteria) || 100;
        progress = userStats.callsMade;
        break;
      case BadgeType.EMAILS_SENT:
        requirement = parseInt(badge.criteria) || 200;
        progress = userStats.emailsSent;
        break;
      case BadgeType.MEETINGS_BOOKED:
        requirement = parseInt(badge.criteria) || 25;
        progress = userStats.meetingsBooked;
        break;
      case BadgeType.TASKS_COMPLETED:
        requirement = parseInt(badge.criteria) || 100;
        progress = userStats.tasksCompleted;
        break;
      case BadgeType.STREAK_DAYS:
        requirement = parseInt(badge.criteria) || 7;
        progress = userStats.streakDays;
        break;
      case BadgeType.LEVEL_MILESTONE:
        requirement = parseInt(badge.criteria) || 5;
        const userPoints = await this.userPointsRepository.findOne({ where: { userId } });
        progress = userPoints?.currentLevel || 0;
        break;
      default:
        throw new BadRequestException(`Unsupported badge type: ${badge.type}`);
    }

    // Check if already earned
    const existingAward = await this.badgeAwardRepository.findOne({
      where: { badgeId: badge.id, recipientId: userId },
    });

    if (existingAward) {
      earned = true;
      earnedAt = existingAward.awardedAt;
    } else {
      earned = progress >= requirement;
    }

    return {
      badgeId: badge.id,
      badgeName: badge.name,
      badgeDescription: badge.description || '',
      badgeIcon: badge.icon || '🏆',
      earned,
      progress: Math.min(progress, requirement),
      requirement,
      progressPercentage: Math.min((progress / requirement) * 100, 100),
      pointsAwarded: badge.points,
      earnedAt,
    };
  }

  async awardBadge(userId: string, badgeId: string, points: number): Promise<void> {
    this.logger.log(`Awarding badge ${badgeId} to user ${userId}`);

    // Check if already awarded
    const existingAward = await this.badgeAwardRepository.findOne({
      where: { badgeId, recipientId: userId },
    });

    if (existingAward) {
      return;
    }

    const badge = await this.badgeRepository.findOne({ where: { id: badgeId } });
    if (!badge) {
      throw new NotFoundException(`Badge with ID ${badgeId} not found`);
    }

    // Create badge award
    const award = this.badgeAwardRepository.create({
      badgeId,
      recipientId: userId,
      awardedAt: new Date(),
      note: 'Badge earned through achievement',
    });

    await this.badgeAwardRepository.save(award);

    // Update user points and badge count
    await this.updateUserPoints(userId, {});
    const userPoints = await this.userPointsRepository.findOne({ where: { userId } });
    if (userPoints) {
      userPoints.badgesEarned += 1;
      userPoints.totalPoints += points;
      await this.userPointsRepository.save(userPoints);
    }

    // Send notification
    await this.sendNotification(userId, 'BADGE_EARNED', 'Badge Earned!', `You've earned the ${badge.name} badge!`, {
      badgeId,
      badgeName: badge.name,
      badgeIcon: badge.icon,
      pointsAwarded: points,
    });
  }

  async createBadge(createBadgeDto: CreateBadgeDto): Promise<BadgeWorkspaceEntity> {
    this.logger.log(`Creating badge: ${createBadgeDto.name}`);

    const badge = this.badgeRepository.create({
      ...createBadgeDto,
      isActive: createBadgeDto.isActive ?? true,
    });

    return await this.badgeRepository.save(badge);
  }

  async createGoal(createGoalDto: CreateGoalDto): Promise<GoalWorkspaceEntity> {
    this.logger.log(`Creating goal: ${createGoalDto.name}`);

    const goal = this.goalRepository.create({
      ...createGoalDto,
      currentValue: 0,
    });

    return await this.goalRepository.save(goal);
  }

  async updateGoalProgress(goalId: string, currentValue: number): Promise<GoalWorkspaceEntity> {
    this.logger.log(`Updating progress for goal: ${goalId}`);

    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['owner'],
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    const previousValue = goal.currentValue;
    goal.currentValue = currentValue;

    await this.goalRepository.save(goal);

    // Check if goal completed
    if (previousValue < goal.targetValue && currentValue >= goal.targetValue) {
      await this.sendNotification(
        goal.ownerId,
        'GOAL_COMPLETED',
        'Goal Completed!',
        `Congratulations! You've completed your goal: ${goal.name}`,
        { goalId, goalName: goal.name },
      );

      // Award bonus points
      await this.updateUserPoints(goal.ownerId, {});
      const userPoints = await this.userPointsRepository.findOne({ where: { userId: goal.ownerId } });
      if (userPoints) {
        userPoints.totalPoints += 100; // Bonus points for goal completion
        await this.userPointsRepository.save(userPoints);
      }
    }

    return goal;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    this.logger.log(`Getting achievements for user: ${userId}`);

    const userStats = await this.getUserStats(userId);
    return await this.checkAchievements(userId, userStats);
  }

  async getUserStats(userId: string): Promise<UserStats> {
    this.logger.log(`Getting stats for user: ${userId}`);

    const userPoints = await this.userPointsRepository.findOne({
      where: { userId },
    });

    if (!userPoints) {
      return {
        userId,
        dealsWon: 0,
        dealsCreated: 0,
        revenue: 0,
        ticketsResolved: 0,
        callsMade: 0,
        emailsSent: 0,
        meetingsBooked: 0,
        tasksCompleted: 0,
        lastActivityDate: new Date(),
        streakDays: 0,
      };
    }

    // TODO: Integrate with actual activity tracking
    return {
      userId,
      dealsWon: userPoints.dealsWon,
      dealsCreated: 0, // Track separately
      revenue: userPoints.revenueGenerated,
      ticketsResolved: 0, // Track separately
      callsMade: 0, // Track separately
      emailsSent: 0, // Track separately
      meetingsBooked: 0, // Track separately
      tasksCompleted: 0, // Track separately
      lastActivityDate: userPoints.lastActivityDate || new Date(),
      streakDays: userPoints.streakDays,
    };
  }

  private calculateTotalPoints(userPoints: UserPointsWorkspaceEntity): number {
    const dealPoints = userPoints.dealsWon * 100;
    const revenuePoints = Math.floor(userPoints.revenueGenerated / 10000);
    const badgePoints = userPoints.badgesEarned * 50;
    const streakPoints = userPoints.streakDays * 5;

    return dealPoints + revenuePoints + badgePoints + streakPoints;
  }

  private calculateLevel(totalPoints: number): number {
    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (totalPoints >= this.levelThresholds[i]) {
        return i;
      }
    }
    return 0;
  }

  private async sendNotification(userId: string, type: string, title: string, message: string, data?: Record<string, any>): Promise<void> {
    const payload: NotificationPayload = {
      userId,
      type: type as any,
      title,
      message,
      data,
    };

    // TODO: Integrate with real notification service
    this.logger.log(`Notification sent to user ${userId}: ${title} - ${message}`);

    // For now, just log the notification
    console.log('GAMIFICATION NOTIFICATION:', JSON.stringify(payload, null, 2));
  }

  async getAvailableBadges(): Promise<BadgeWorkspaceEntity[]> {
    return await this.badgeRepository.find({
      where: { isActive: true },
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async getUserBadges(userId: string): Promise<BadgeAwardWorkspaceEntity[]> {
    return await this.badgeAwardRepository.find({
      where: { recipientId: userId },
      relations: ['badge'],
      order: { awardedAt: 'DESC' },
    });
  }

  async getUserGoals(userId: string): Promise<GoalWorkspaceEntity[]> {
    return await this.goalRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
