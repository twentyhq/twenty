import { computeLogicFunctionCronTriggerSpreadDelay } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/utils/compute-logic-function-cron-trigger-spread-delay.util';

const CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617';
const PENDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'd7d1170f-abb1-4c9b-8258-13219a611b03';
const STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'e362aa9b-52c6-4b7e-bb20-927e0e8d7cbe';

describe('computeLogicFunctionCronTriggerSpreadDelay', () => {
  const input = {
    workspaceId: 'workspace-id',
    applicationUniversalIdentifier:
      CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER,
    logicFunctionUniversalIdentifier:
      PENDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    cronPattern: '*/15 * * * *',
  };

  it('returns a stable delay within the Call Recorder cron interval', () => {
    const delay = computeLogicFunctionCronTriggerSpreadDelay(input);

    expect(delay).toBe(49_026);
    expect(computeLogicFunctionCronTriggerSpreadDelay(input)).toBe(delay);
    expect(delay).toBeLessThan(14 * 60 * 1000);
    expect(
      computeLogicFunctionCronTriggerSpreadDelay({
        ...input,
        workspaceId: 'another-workspace',
      }),
    ).not.toBe(delay);
  });

  it('spreads stale bot reconciliation independently', () => {
    const delay = computeLogicFunctionCronTriggerSpreadDelay({
      ...input,
      logicFunctionUniversalIdentifier:
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });

    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThan(14 * 60 * 1000);
    expect(delay).not.toBe(computeLogicFunctionCronTriggerSpreadDelay(input));
  });

  it('supports installed versions that still run every five minutes', () => {
    const delay = computeLogicFunctionCronTriggerSpreadDelay({
      ...input,
      cronPattern: '*/5 * * * *',
    });

    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThan(4 * 60 * 1000);
  });

  it.each([
    { applicationUniversalIdentifier: 'another-application' },
    { logicFunctionUniversalIdentifier: 'another-logic-function' },
    { cronPattern: '0 4 * * *' },
  ])('does not spread unrelated cron triggers', (override) => {
    expect(
      computeLogicFunctionCronTriggerSpreadDelay({ ...input, ...override }),
    ).toBe(0);
  });
});
