import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

@InputType()
export class UpdateApplicationRegistrationVariablePayload {
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(10000)
  @IsOptional()
  value?: PlaintextString;

  @Field({ nullable: true })
  @IsOptional()
  resetValue?: boolean;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;
}

@InputType()
export class UpdateApplicationRegistrationVariableInput {
  @IsNotEmpty()
  @Field()
  @IsUUID()
  id: string;

  @Type(() => UpdateApplicationRegistrationVariablePayload)
  @ValidateNested()
  @Field(() => UpdateApplicationRegistrationVariablePayload)
  update: UpdateApplicationRegistrationVariablePayload;
}
