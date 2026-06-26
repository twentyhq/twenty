import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Customer-entered execution details. v1 captures the legal entity name and the
// authorized signatory (name + title) — no signature-pad / external e-sign.
@InputType()
export class GenerateSignedDpaInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerLegalEntityName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  signatoryName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  signatoryTitle: string;
}
