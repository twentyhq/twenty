import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType('TriggerInstallApplicationInput')
export class TriggerInstallApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;
}
