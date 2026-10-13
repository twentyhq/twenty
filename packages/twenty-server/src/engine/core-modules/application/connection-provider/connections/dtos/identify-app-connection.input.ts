import { Field, ID, InputType } from '@nestjs/graphql';

import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { TRIMMED_TEXT_WITHOUT_NUL_PATTERN } from 'src/engine/core-modules/application/connection-provider/connections/constants/trimmed-text-without-nul-pattern.constant';

@InputType('IdentifyAppConnectionInput')
export class IdentifyAppConnectionInput {
  @IsUUID()
  @Field(() => ID)
  connectedAccountId: string;

  @IsString()
  @MaxLength(512)
  @Matches(TRIMMED_TEXT_WITHOUT_NUL_PATTERN, {
    message:
      'externalAccountId must be non-empty, without surrounding whitespace or NUL characters',
  })
  @Field()
  externalAccountId: string;

  @IsString()
  @IsOptional()
  @MaxLength(320)
  @Matches(TRIMMED_TEXT_WITHOUT_NUL_PATTERN, {
    message:
      'handle must be non-empty, without surrounding whitespace or NUL characters',
  })
  @Field({ nullable: true })
  handle?: string;
}
