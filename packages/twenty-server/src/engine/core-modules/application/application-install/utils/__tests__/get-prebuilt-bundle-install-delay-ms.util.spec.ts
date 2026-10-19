import { getPrebuiltBundleInstallDelayMs } from 'src/engine/core-modules/application/application-install/utils/get-prebuilt-bundle-install-delay-ms.util';

const NOW = 1_000_000;

describe('getPrebuiltBundleInstallDelayMs', () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  it('places each install one interval after the previous one', () => {
    const reservation = { startsAt: NOW + 5_000, installIntervalMs: 1_000 };

    expect(
      [0, 1, 2].map((installIndex) =>
        getPrebuiltBundleInstallDelayMs({ reservation, installIndex }),
      ),
    ).toEqual([5_000, 6_000, 7_000]);
  });

  it('never returns a negative delay once the slot has passed', () => {
    expect(
      getPrebuiltBundleInstallDelayMs({
        reservation: { startsAt: NOW - 5_000, installIntervalMs: 1_000 },
        installIndex: 1,
      }),
    ).toBe(0);
  });
});
