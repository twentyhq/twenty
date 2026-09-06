import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType('TriggerInstallApplicationJobInput')
export class TriggerInstallApplicationJobInput {
  @IsString()
  @Field()
  universalIdentifier: string;
}
