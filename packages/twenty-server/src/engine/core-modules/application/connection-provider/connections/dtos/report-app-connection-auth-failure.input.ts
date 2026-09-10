import { Field, ID, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType('ReportAppConnectionAuthFailureInput')
export class ReportAppConnectionAuthFailureInput {
  @IsUUID()
  @Field(() => ID)
  id: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Field({ nullable: true })
  reason?: string;
}
