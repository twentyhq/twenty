import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { assertUsageLimitDefaultOverrideIsAllowed } from 'src/engine/core-modules/usage-limit/utils/assert-usage-limit-default-override-is-allowed.util';
import {
  buildUsageLimitScope,
  type UsageLimitScope,
} from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildScope = (
  overrides: Partial<UsageLimitScope> = {},
): UsageLimitScope =>
  buildUsageLimitScope({
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'stock',
    periodCount: 1,
    periodUnit: 'lifetime',
    meter: 'bytes',
    ...overrides,
  });

describe('assertUsageLimitDefaultOverrideIsAllowed', () => {
  it('refuses a workspace write that would replace a default', () => {
    expect(() =>
      assertUsageLimitDefaultOverrideIsAllowed({
        scope: buildScope(),
        isOperator: false,
      }),
    ).toThrow(UsageLimitException);
  });

  it('lets an operator replace the same default', () => {
    expect(() =>
      assertUsageLimitDefaultOverrideIsAllowed({
        scope: buildScope(),
        isOperator: true,
      }),
    ).not.toThrow();
  });

  it('lets a workspace write where only a non-overridable default stands, since it can only tighten', () => {
    expect(() =>
      assertUsageLimitDefaultOverrideIsAllowed({
        scope: buildScope({
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.API_REQUEST,
          spenderType: 'application',
          limitKind: 'speed',
          periodUnit: 'second',
          meter: 'quantity',
        }),
        isOperator: false,
      }),
    ).not.toThrow();
  });

  it('lets a workspace write scoped to one spender', () => {
    expect(() =>
      assertUsageLimitDefaultOverrideIsAllowed({
        scope: buildScope({
          spenderId: 'ef0cfbbd-8b6e-4f9d-9a7c-1a2b3c4d5e6f',
        }),
        isOperator: false,
      }),
    ).not.toThrow();
  });

  it('lets a workspace write on a scope no default covers', () => {
    expect(() =>
      assertUsageLimitDefaultOverrideIsAllowed({
        scope: buildScope({ meter: 'quantity' }),
        isOperator: false,
      }),
    ).not.toThrow();
  });
});
