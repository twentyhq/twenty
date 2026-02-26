import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class UpdateApplicationRegistrationVariableInput {
  @Field()
  @IsUUID()
  id: string;

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
