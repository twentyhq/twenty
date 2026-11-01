import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType('TriggerUninstallApplicationInput')
export class TriggerUninstallApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;
}
