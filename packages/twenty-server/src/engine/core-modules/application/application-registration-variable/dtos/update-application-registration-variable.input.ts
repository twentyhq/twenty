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

@InputType()
export class UpdateApplicationRegistrationVariablePayload {
  @Field({ nullable: true })
  @IsString()
  @MaxLength(10000)
  @IsOptional()
  value?: string;

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
