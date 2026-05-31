import { Field, Int, ObjectType } from '@nestjs/graphql';

import { SigningKeyDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-key.dto';

@ObjectType()
export class SigningKeysAdminPanelDTO {
  @Field(() => [SigningKeyDTO])
  signingKeys: SigningKeyDTO[];

  @Field(() => Int)
  legacyVerifyCountInWindow: number;

  @Field(() => Int)
  verifyWindowDays: number;
}
