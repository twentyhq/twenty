import { Field, ObjectType, createUnionType } from '@nestjs/graphql';

import { AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';

@ObjectType()
export class GenerateJWTOutputWithAuthTokens {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  reason: 'WORKSPACE_AVAILABLE_FOR_SWITCH';

  @Field(() => AuthTokens)
  authTokens: AuthTokens;
}

@ObjectType()
export class GenerateJWTOutputWithSSOAUTH {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  reason: 'WORKSPACE_USE_SSO_AUTH';

  @Field(() => [FindAvailableSSOIDPOutput])
  availableSSOIDPs: Array<FindAvailableSSOIDPOutput>;
}

export const GenerateJWTOutput = createUnionType({
  name: 'GenerateJWT',
  types: () => [GenerateJWTOutputWithAuthTokens, GenerateJWTOutputWithSSOAUTH],
  resolveType(value) {
    if (value.reason === 'WORKSPACE_AVAILABLE_FOR_SWITCH') {
      return GenerateJWTOutputWithAuthTokens;
    }
    if (value.reason === 'WORKSPACE_USE_SSO_AUTH') {
      return GenerateJWTOutputWithSSOAUTH;
    }

    return null;
  },
});
