import { getManagementBudgetDelayMs } from 'src/engine/core-modules/application/application-install/utils/get-management-budget-delay-ms.util';

const NOW = 1_000_000;

describe('getManagementBudgetDelayMs', () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  it('places each install one interval after the previous one', () => {
    const reservation = { startsAt: NOW + 5_000, functionIntervalMs: 1_000 };

    expect(
      [0, 1, 2].map((functionIndex) =>
        getManagementBudgetDelayMs({ reservation, functionIndex }),
      ),
    ).toEqual([5_000, 6_000, 7_000]);
  });

  it('never returns a negative delay once the slot has passed', () => {
    expect(
      getManagementBudgetDelayMs({
        reservation: { startsAt: NOW - 5_000, functionIntervalMs: 1_000 },
        functionIndex: 1,
      }),
    ).toBe(0);
  });
});
