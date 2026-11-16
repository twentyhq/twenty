import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('TwoFactorAuthenticationBackupCodeStatus')
export class TwoFactorAuthenticationBackupCodeStatusDTO {
  @Field(() => Int)
  remainingBackupCodeCount: number;
}
