import { isApplicationUninstallHookPending } from 'src/engine/core-modules/application/utils/is-application-uninstall-hook-pending.util';

describe('isApplicationUninstallHookPending', () => {
  const uninstallRequestedAt = new Date('2026-08-18T10:00:00.000Z');

  it('should return false when the application has no uninstall hook', () => {
    expect(
      isApplicationUninstallHookPending(
        {
          uninstallLogicFunctionId: null,
          uninstallHookCompletedForRequestedAt: null,
        },
        uninstallRequestedAt,
      ),
    ).toBe(false);
  });

  it('should return true when the hook never completed', () => {
    expect(
      isApplicationUninstallHookPending(
        {
          uninstallLogicFunctionId: 'logic-function-id',
          uninstallHookCompletedForRequestedAt: null,
        },
        uninstallRequestedAt,
      ),
    ).toBe(true);
  });

  it('should return true when the hook only completed for an earlier request', () => {
    expect(
      isApplicationUninstallHookPending(
        {
          uninstallLogicFunctionId: 'logic-function-id',
          uninstallHookCompletedForRequestedAt: new Date(
            '2026-08-17T10:00:00.000Z',
          ),
        },
        uninstallRequestedAt,
      ),
    ).toBe(true);
  });

  it('should return false when the hook completed for the same request', () => {
    expect(
      isApplicationUninstallHookPending(
        {
          uninstallLogicFunctionId: 'logic-function-id',
          uninstallHookCompletedForRequestedAt: uninstallRequestedAt,
        },
        uninstallRequestedAt,
      ),
    ).toBe(false);
  });
});
