import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class ValidateTrustedDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  validationToken: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  workspaceTrustedDomainId: string;
}
