import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType('TriggerInstallApplicationJobInput')
export class TriggerInstallApplicationJobInput {
  @IsString()
  @Field()
  universalIdentifier: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  version?: string;

  @IsOptional()
  @IsUUID()
  @Field({ nullable: true })
  jobId?: string;
}
