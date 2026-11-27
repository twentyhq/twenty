import { ArgsType, Field } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@ArgsType()
export class SetApplicationPrimaryPublicDomainInput {
  @Field(() => String)
  @IsUUID()
  applicationId: string;

  @Field(() => String)
  @IsUUID()
  publicDomainId: string;
}
