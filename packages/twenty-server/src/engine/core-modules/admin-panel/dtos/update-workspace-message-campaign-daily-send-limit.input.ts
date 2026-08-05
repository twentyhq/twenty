import { ArgsType, Field, Int } from '@nestjs/graphql';

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { MESSAGE_CAMPAIGN_DAILY_SEND_LIMIT_MAX } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class UpdateWorkspaceMessageCampaignDailySendLimitInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MESSAGE_CAMPAIGN_DAILY_SEND_LIMIT_MAX)
  dailySendLimit?: number | null;
}
