import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@InputType()
export class TestImapConnectionInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  host: string;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  port: number;

  @Field(() => Boolean)
  @IsNotEmpty()
  secure: boolean;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  handle: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  password: string;
}

@InputType()
export class SaveImapConnectionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  accountOwnerId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  handle: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  host: string;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  port: number;

  @Field(() => Boolean)
  @IsNotEmpty()
  secure: boolean;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field(() => MessageChannelVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(MessageChannelVisibility)
  messageVisibility?: MessageChannelVisibility;
}
