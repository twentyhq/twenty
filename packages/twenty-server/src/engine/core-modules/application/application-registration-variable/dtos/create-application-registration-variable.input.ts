import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateApplicationRegistrationVariableInput {
  @Field()
  @IsUUID()
  applicationRegistrationId: string;

  @Field()
  @IsString()
  @MaxLength(256)
  key: string;

  @Field()
  @IsString()
  @MaxLength(10000)
  value: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;
}
