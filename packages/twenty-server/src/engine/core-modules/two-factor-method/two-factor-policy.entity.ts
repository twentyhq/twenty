import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TwoFactorAuthenticationPolicyEnforcement, TwoFactorAuthenticationProviders } from 'twenty-shared/workspace';

registerEnumType(TwoFactorAuthenticationPolicyEnforcement, {
  name: 'TwoFactorAuthenticationPolicyEnforcement',
  description: '2FA Policy Enforcement',
});


registerEnumType(TwoFactorAuthenticationProviders, {
  name: 'TwoFactorAuthenticationProviders',
  description: '2FA Authentication Providers',
});

@ObjectType('TwoFactorPolicy')
export class TwoFactorPolicy {
    @Field(() => TwoFactorAuthenticationPolicyEnforcement)
    level: TwoFactorAuthenticationPolicyEnforcement
    
    @Field(() => TwoFactorAuthenticationProviders)
    providers: TwoFactorAuthenticationProviders
}
