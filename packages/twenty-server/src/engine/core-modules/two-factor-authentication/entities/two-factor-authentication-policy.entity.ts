import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

registerEnumType(TwoFactorAuthenticationStrategy, {
  name: 'TwoFactorAuthenticationStrategy',
  description: '2FA Authentication Providers',
});

@ObjectType('TwoFactorAuthenticationPolicy')
export class TwoFactorAuthenticationPolicy {
  @Field(() => TwoFactorAuthenticationStrategy)
  strategy: TwoFactorAuthenticationStrategy;

  @Field(() => Boolean)
  enforce: boolean;
}
