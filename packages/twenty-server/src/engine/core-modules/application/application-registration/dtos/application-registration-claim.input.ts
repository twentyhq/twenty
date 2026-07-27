import { ArgsType, Field } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@ArgsType()
export class ApplicationRegistrationClaimInput {
  @Field(() => String)
  @IsUUID()
  applicationRegistrationId: string;
}
