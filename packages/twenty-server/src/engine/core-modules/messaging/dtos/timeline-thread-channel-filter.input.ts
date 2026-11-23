import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('TimelineThreadChannelFilterInput')
export class TimelineThreadChannelFilterInput {
  @Field(() => MessageChannelType)
  @IsEnum(MessageChannelType)
  type: MessageChannelType;

  @Field(() => String)
  @IsEnum(ConnectedAccountProvider)
  provider: ConnectedAccountProvider;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  applicationId?: string | null;
}
