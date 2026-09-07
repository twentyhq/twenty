import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType('TriggerUninstallApplicationJobInput')
export class TriggerUninstallApplicationJobInput {
  @IsString()
  @Field()
  universalIdentifier: string;
}
