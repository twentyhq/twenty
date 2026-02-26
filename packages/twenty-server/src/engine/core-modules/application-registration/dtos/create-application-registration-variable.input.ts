import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateApplicationRegistrationVariableInput {
  @Field()
  @IsUUID()
  applicationRegistrationId: string;

  @Field()
  @IsString()
  key: string;

  @Field()
  @IsString()
  value: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;
}
