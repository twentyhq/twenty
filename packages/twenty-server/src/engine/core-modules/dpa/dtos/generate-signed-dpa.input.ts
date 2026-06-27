import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
