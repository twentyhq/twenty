import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

export const assertUsageLimitInstanceOverrideIsAllowed = ({
  usageLimit,
  isOperator,
}: {
  usageLimit: Pick<UsageLimitEntity, 'isInstanceOverride'>;
  isOperator: boolean;
}): void => {
  if (isOperator || !usageLimit.isInstanceOverride) {
    return;
  }

  throw new UsageLimitException(
    'This limit was set by an operator and only an operator can change it',
    UsageLimitExceptionCode.LIMIT_FORBIDDEN,
  );
};
