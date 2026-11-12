import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TwoFactorAuthenticationBackupCodes')
export class TwoFactorAuthenticationBackupCodesDTO {
  @Field(() => [String])
  backupCodes: string[];
}
