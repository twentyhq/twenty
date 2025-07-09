import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InitiateTwoFactorAuthenticationProvisioningOutput {
  @Field(() => String)
  uri: string;
}
