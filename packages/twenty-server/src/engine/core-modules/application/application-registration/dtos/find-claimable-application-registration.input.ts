import { ArgsType, Field } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class FindClaimableApplicationRegistrationInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sourcePackage?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  universalIdentifier?: string;
}
