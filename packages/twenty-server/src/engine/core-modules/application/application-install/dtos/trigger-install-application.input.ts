import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApplicationGrantObjectScopeInput } from 'src/engine/core-modules/application/application-grant/dtos/application-grant-object-scope.input';

@InputType('TriggerInstallApplicationInput')
export class TriggerInstallApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationGrantObjectScopeInput)
  @Field(() => [ApplicationGrantObjectScopeInput], { nullable: true })
  grantObjectScopes?: ApplicationGrantObjectScopeInput[];
}
