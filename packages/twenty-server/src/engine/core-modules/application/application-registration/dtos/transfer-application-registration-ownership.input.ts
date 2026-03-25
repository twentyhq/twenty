import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class TransferApplicationRegistrationOwnershipInput {
  @Field(() => String)
  @IsUUID()
  applicationRegistrationId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  targetWorkspaceSubdomain: string;
}
