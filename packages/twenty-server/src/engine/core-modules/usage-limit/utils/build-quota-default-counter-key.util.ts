import { type QuotaDefaultKeyScope } from 'src/engine/core-modules/usage-limit/types/quota-default-key-scope.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';

export const buildQuotaDefaultCounterKey = ({
  limitValue,
  ...scope
}: QuotaDefaultKeyScope & { limitValue: number }): string =>
  `${buildQuotaCounterKey(scope)}:default:${limitValue}`;
