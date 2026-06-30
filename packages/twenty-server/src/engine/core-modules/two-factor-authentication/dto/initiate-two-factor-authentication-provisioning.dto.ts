import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('InitiateTwoFactorAuthenticationProvisioning')
export class InitiateTwoFactorAuthenticationProvisioningDTO {
  @Field(() => String)
  uri: string;
}
