import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class DeleteSsoInput {
  @Field(() => String)
  @IsString()
  idpId: string;
}
