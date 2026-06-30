import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class UserLookupInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  userIdentifier: string;
}
