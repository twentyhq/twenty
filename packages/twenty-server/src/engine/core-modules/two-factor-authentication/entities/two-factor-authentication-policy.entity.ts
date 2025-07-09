import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  TwoFactorAuthenticationStrategy
} from 'twenty-shared/types';


registerEnumType(TwoFactorAuthenticationStrategy, {
  name: 'TwoFactorAuthenticationProviders',
  description: '2FA Authentication Providers',
});

@ObjectType('TwoFactorPolicy')
export class TwoFactorAuthenticationPolicy {
  @Field(() => TwoFactorAuthenticationStrategy)
  providers: TwoFactorAuthenticationStrategy;
}
