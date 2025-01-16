import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';
@ArgsType()
export class GetLabPublicFeatureFlagsInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  workspaceId: string;
}
