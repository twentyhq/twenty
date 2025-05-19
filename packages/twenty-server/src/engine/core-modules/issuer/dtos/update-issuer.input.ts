import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { CreateIssuerInput } from './create-issuer.input';

@InputType()
export class UpdateIssuerInput extends PartialType(CreateIssuerInput) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  // All other fields are inherited as optional from CreateIssuerInput via PartialType
}
