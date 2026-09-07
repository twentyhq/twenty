import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType('TriggerUninstallApplicationJobInput')
export class TriggerUninstallApplicationJobInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;
}
