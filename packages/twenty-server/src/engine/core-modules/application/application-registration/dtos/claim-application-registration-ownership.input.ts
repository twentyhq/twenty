import { ArgsType, Field } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@ArgsType()
export class ClaimApplicationRegistrationOwnershipInput {
  @Field(() => String)
  @IsUUID()
  applicationRegistrationId: string;
}
