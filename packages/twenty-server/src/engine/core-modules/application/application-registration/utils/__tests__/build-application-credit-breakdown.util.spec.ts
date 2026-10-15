import { USAGE_OPERATION_TYPES } from 'twenty-shared/application';

import { buildApplicationCreditBreakdown } from 'src/engine/core-modules/application/application-registration/utils/build-application-credit-breakdown.util';

const usage = (
  operationType: string,
  creditsUsedMicro: string,
  resourceType = 'APP',
  resourceContext = '',
) => ({ operationType, creditsUsedMicro, resourceType, resourceContext });

describe('buildApplicationCreditBreakdown', () => {
  it('supports every USAGE_OPERATION_TYPES value and orders consumption highest first', () => {
    const result = buildApplicationCreditBreakdown({
      billingDefinitions: [],
      usageRows: USAGE_OPERATION_TYPES.map((operationType, index) =>
        usage(operationType, String((index + 1) * 1000000)),
      ),
    });

    expect(
      result.creditBreakdown.map(({ operationType }) => operationType),
    ).toEqual([...USAGE_OPERATION_TYPES].reverse());
    expect(result.totalCreditsConsumed).toBe(
      (USAGE_OPERATION_TYPES.length * (USAGE_OPERATION_TYPES.length + 1)) / 2,
    );
    expect(
      result.creditBreakdown.every(({ isAppDefined }) => !isAppDefined),
    ).toBe(true);
  });

  it('keeps named charges distinct from platform usage and other operations with the same base type', () => {
    const result = buildApplicationCreditBreakdown({
      billingDefinitions: [
        {
          operations: {
            first: {
              label: 'First operation',
              operationType: 'CODE_EXECUTION',
            },
            second: {
              label: 'Second operation',
              operationType: 'CODE_EXECUTION',
            },
          },
        },
      ],
      usageRows: [
        usage('CODE_EXECUTION', '1000000', 'APP', 'first'),
        usage('CODE_EXECUTION', '2000000', 'APP', 'second'),
        usage('CODE_EXECUTION', '3000000', 'LOGIC_FUNCTION', 'first'),
      ],
    });

    expect(
      result.creditBreakdown.map(({ label, creditsConsumed }) => [
        label,
        creditsConsumed,
      ]),
    ).toEqual([
      ['CODE_EXECUTION', 3],
      ['Second operation', 2],
      ['First operation', 1],
    ]);
    expect(result.totalCreditsConsumed).toBe(6);
  });

  it('supports recurring charges and additional recorded platform operation types without an Other bucket', () => {
    const result = buildApplicationCreditBreakdown({
      billingDefinitions: [
        {
          recurring: {
            seats: {
              label: 'Workspace seats',
              amountMicroCredits: 1000000,
              period: 'MONTH',
            },
          },
        },
      ],
      usageRows: [
        usage('SUBSCRIPTION', '3000000', 'APP', 'seats'),
        usage('API_REQUEST', '2000000', 'API'),
        usage('FUTURE_OPERATION', '1000000', 'API'),
      ],
    });

    expect(result.creditBreakdown.map(({ label }) => label)).toEqual([
      'Workspace seats',
      'API_REQUEST',
      'FUTURE_OPERATION',
    ]);
    expect(result.totalCreditsConsumed).toBe(6);
  });

  it('does not expose arbitrary resource contexts as operation names', () => {
    const result = buildApplicationCreditBreakdown({
      billingDefinitions: [],
      usageRows: [
        usage('CALL_RECORDING', '1000000', 'APP', 'private-customer-reference'),
      ],
    });

    expect(result.creditBreakdown).toEqual([
      {
        key: 'type:CALL_RECORDING',
        operationType: 'CALL_RECORDING',
        label: 'CALL_RECORDING',
        isAppDefined: false,
        creditsConsumed: 1,
      },
    ]);
  });

  it('prefers current labels over older declarations and preserves distinct historical operation types', () => {
    const result = buildApplicationCreditBreakdown({
      billingDefinitions: [
        {
          operations: {
            action: { label: 'Current label', operationType: 'CODE_EXECUTION' },
          },
        },
        {
          operations: {
            action: { label: 'Old label', operationType: 'CODE_EXECUTION' },
          },
        },
        {
          operations: {
            action: { label: 'Historical charge', operationType: 'WEB_SEARCH' },
          },
        },
      ],
      usageRows: [
        usage('CODE_EXECUTION', '1000000', 'APP', 'action'),
        usage('WEB_SEARCH', '2000000', 'APP', 'action'),
      ],
    });

    expect(result.creditBreakdown.map(({ label }) => label)).toEqual([
      'Historical charge',
      'Current label',
    ]);
    expect(new Set(result.creditBreakdown.map(({ key }) => key)).size).toBe(2);
  });

  it('omits unused and zero-consumption operations while keeping fractional credits precise', () => {
    const result = buildApplicationCreditBreakdown({
      billingDefinitions: [
        {
          operations: {
            unused: { label: 'Unused operation', operationType: 'EMAIL_SEND' },
          },
        },
      ],
      usageRows: [
        usage('WEB_SEARCH', '0'),
        usage('CODE_EXECUTION', '1'),
        usage('CODE_EXECUTION', '2'),
      ],
    });

    expect(result.creditBreakdown).toHaveLength(1);
    expect(result.creditBreakdown[0].creditsConsumed).toBe(0.000003);
    expect(result.totalCreditsConsumed).toBe(0.000003);
  });
});
