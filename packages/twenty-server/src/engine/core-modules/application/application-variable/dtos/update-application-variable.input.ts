import { ArgsType, Field } from '@nestjs/graphql';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class UpdateApplicationVariableEntityInput {
  @Field(() => String, { nullable: false })
  key: string;

  @Field(() => String, { nullable: false })
  value: PlaintextString;

  // Inferred from the token for an application caller; required for a session
  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;
}
