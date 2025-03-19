// traceable-link-logs/dtos/update-traceable-link-log.input.ts

import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateTraceableLinkLogInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  linkId?: string;

  @Field({ nullable: true })
  @IsString()
  utmSource?: string;

  @Field({ nullable: true })
  @IsString()
  utmMedium?: string;

  @Field({ nullable: true })
  @IsString()
  utmCampaign?: string;

  @Field({ nullable: true })
  @IsString()
  userIp?: string;

  @Field({ nullable: true })
  @IsString()
  userAgent?: string;
}
