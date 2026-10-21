import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType('TriggerUpgradeApplicationInput')
export class TriggerUpgradeApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  targetVersion: string;
}
