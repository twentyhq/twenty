import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TwoFactorAuthenticationMethodSummary')
export class TwoFactorAuthenticationMethodSummaryDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  twoFactorAuthenticationMethodId: string;

  @Field({ nullable: false })
  status: string;

  @Field({ nullable: false })
  strategy: string;
}
