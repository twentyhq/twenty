import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('VerifyTwoFactorAuthenticationMethod')
export class VerifyTwoFactorAuthenticationMethodDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => [String], { nullable: true })
  backupCodes: string[] | null;
}
