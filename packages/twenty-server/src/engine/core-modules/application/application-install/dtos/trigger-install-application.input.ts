import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApplicationGrantObjectAccessInput } from 'src/engine/core-modules/application/application-grant/dtos/application-grant-object-access.input';

@InputType('TriggerInstallApplicationInput')
export class TriggerInstallApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  // Omitted, the grant is exactly what the app requests
  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationGrantObjectAccessInput)
  @Field(() => ApplicationGrantObjectAccessInput, { nullable: true })
  grantObjectAccess?: ApplicationGrantObjectAccessInput;
}
