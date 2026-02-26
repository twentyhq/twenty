import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateApplicationRegistrationVariableInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
