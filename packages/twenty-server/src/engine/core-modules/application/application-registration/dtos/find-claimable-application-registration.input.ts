import { ArgsType, Field } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

// Look up an unclaimed npm app by its exact npm package name or its
// universal identifier. Exactly one must be provided (validated in the
// service).
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
