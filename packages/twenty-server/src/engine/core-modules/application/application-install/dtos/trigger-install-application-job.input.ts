import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType('TriggerInstallApplicationJobInput')
export class TriggerInstallApplicationJobInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;
}
