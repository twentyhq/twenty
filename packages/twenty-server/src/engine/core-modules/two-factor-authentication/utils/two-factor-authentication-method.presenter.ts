import { isDefined } from 'twenty-shared/utils';

import { type TwoFactorAuthenticationMethodSummaryDto } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-method.dto';
import { type TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';

export function buildTwoFactorAuthenticationMethodSummary(
  methods: TwoFactorAuthenticationMethodEntity[] | undefined,
): TwoFactorAuthenticationMethodSummaryDto[] | undefined {
  if (!isDefined(methods)) return undefined;

  return methods.map((method) => ({
    twoFactorAuthenticationMethodId: method.id,
    status: method.status,
    strategy: method.strategy,
  }));
}
