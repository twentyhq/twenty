import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum BadgeType {
  DEALS_WON = 'deals_won',
  REVENUE_MILESTONE = 'revenue_milestone',
  STREAK = 'streak',
  SPEED = 'speed',
  TEAM_PLAYER = 'team_player',
  CUSTOM = 'custom',
}

@Entity('leaderboard_entry')
@Index(['workspaceId', 'period'])
export class LeaderboardEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  period: string;

  @Column({ type: 'int', default: 0 })
  dealsWon: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'int', default: 0 })
  activitiesCompleted: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  quotaAttainment: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('badge')
@Index(['workspaceId', 'userId'])
export class BadgeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'enum', enum: BadgeType })
  type: BadgeType;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @CreateDateColumn()
  earnedAt: Date;
}

@Entity('sales_challenge')
@Index(['workspaceId'])
export class SalesChallengeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  metric: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: false })
  target: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reward: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  participantIds: string[];

  @Column({ nullable: true })
  winnerId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
