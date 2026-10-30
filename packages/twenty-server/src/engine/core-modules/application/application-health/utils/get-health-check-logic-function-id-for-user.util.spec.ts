import { getHealthCheckLogicFunctionIdForUser } from 'src/engine/core-modules/application/application-health/utils/get-health-check-logic-function-id-for-user.util';

const HEALTH_CHECK_LOGIC_FUNCTION_ID = 'health-check-logic-function-id';

describe('getHealthCheckLogicFunctionIdForUser', () => {
  it('returns the existing function when member execution is enabled', () => {
    expect(
      getHealthCheckLogicFunctionIdForUser({
        healthCheckLogicFunctionId: HEALTH_CHECK_LOGIC_FUNCTION_ID,
        isUserHealthCheckEnabled: true,
      }),
    ).toBe(HEALTH_CHECK_LOGIC_FUNCTION_ID);
  });

  it.each([false, undefined])(
    'does not expose a function when member opt-in is %s',
    (isUserHealthCheckEnabled) => {
      expect(
        getHealthCheckLogicFunctionIdForUser({
          healthCheckLogicFunctionId: HEALTH_CHECK_LOGIC_FUNCTION_ID,
          isUserHealthCheckEnabled,
        }),
      ).toBeNull();
    },
  );

  it.each([null, undefined])(
    'does not expose a missing function (%s) even when opted in',
    (healthCheckLogicFunctionId) => {
      expect(
        getHealthCheckLogicFunctionIdForUser({
          healthCheckLogicFunctionId,
          isUserHealthCheckEnabled: true,
        }),
      ).toBeNull();
    },
  );

  it('keeps an unavailable declaration workspace-only', () => {
    expect(getHealthCheckLogicFunctionIdForUser({})).toBeNull();
  });
});
