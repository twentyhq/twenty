import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export const GAMIFICATION_BADGE_TYPES = [
  'DEALS_WON',
  'REVENUE',
  'DEALS_CREATED',
  'TICKETS_RESOLVED',
] as const;

export type GamificationBadgeType = (typeof GAMIFICATION_BADGE_TYPES)[number];

export class GamificationLeaderboardUserDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  dealsWon: number;

  @IsNumber()
  @Min(0)
  revenue: number;

  @IsInt()
  @Min(0)
  badgeCount: number;
}

export class GamificationLeaderboardRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GamificationLeaderboardUserDto)
  users: GamificationLeaderboardUserDto[];
}

export class GamificationBadgeDto {
  @IsIn(GAMIFICATION_BADGE_TYPES)
  type: GamificationBadgeType;

  @IsString()
  criteria: string;
}

export class GamificationUserStatsDto {
  @IsInt()
  @Min(0)
  dealsWon: number;

  @IsNumber()
  @Min(0)
  revenue: number;

  @IsInt()
  @Min(0)
  dealsCreated: number;

  @IsInt()
  @Min(0)
  ticketsResolved: number;
}

export class GamificationAchievementsRequestDto {
  @ValidateNested()
  @Type(() => GamificationUserStatsDto)
  userStats: GamificationUserStatsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GamificationBadgeDto)
  badges: GamificationBadgeDto[];
}
