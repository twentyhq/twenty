import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class ValidateApprovedAccessDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  validationToken: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  approvedAccessDomainId: string;
}
