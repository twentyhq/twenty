import { ArgsType, Field } from '@nestjs/graphql';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

@ArgsType()
export class UpdateMyApplicationVariableInput {
  @Field(() => String)
  applicationUniversalIdentifier: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  value: PlaintextString;
}
