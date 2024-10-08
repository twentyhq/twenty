import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@ObjectType()
export class DeleteSsoOutput {
  @Field(() => String)
  idpId: string;
}
