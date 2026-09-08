import { isBillingExemptApplication } from 'src/engine/core-modules/application/application-marketplace/utils/is-billing-exempt-application.util';
import { computeLogicFunctionExecutionCreditsMicro } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/compute-logic-function-execution-credits-micro.util';

describe('isBillingExemptApplication', () => {
  it.each([
    '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
    '66a504cc-0a75-410e-a43f-cdeae1db1522',
    '8bdaaa9f-dc53-4247-a89b-aa386c9b3244',
  ])('should return true for billing-exempt app %s', (universalIdentifier) => {
    expect(isBillingExemptApplication(universalIdentifier)).toBe(true);
  });

  it('does not charge invocation or duration credits for Companion polling and recovery', () => {
    expect(
      computeLogicFunctionExecutionCreditsMicro({
        durationMs: 30_000,
        isBillingExempt: isBillingExemptApplication(
          '8bdaaa9f-dc53-4247-a89b-aa386c9b3244',
        ),
      }),
    ).toEqual({
      invocationCreditsMicro: 0,
      durationCreditsMicro: 0,
      billedDurationMs: 0,
    });
  });

  it('should return false for a non-exempt app', () => {
    expect(
      isBillingExemptApplication('97141c95-2870-5662-8992-44fb6536be9a'),
    ).toBe(false);
  });
});
