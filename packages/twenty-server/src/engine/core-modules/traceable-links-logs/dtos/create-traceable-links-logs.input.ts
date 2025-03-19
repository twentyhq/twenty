// traceable-link-logs/dtos/create-traceable-link-log.input.ts

import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateTraceableLinkLogInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  linkId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  utmSource: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  utmMedium: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  utmCampaign: string;

  @Field({ nullable: true })
  @IsString()
  userIp?: string;

  @Field({ nullable: true })
  @IsString()
  userAgent?: string;
}
