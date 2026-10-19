import { getDeploymentDelayMs } from 'src/engine/core-modules/application/application-install/utils/get-deployment-delay-ms.util';

const NOW = 1_000_000;

describe('getDeploymentDelayMs', () => {
  beforeEach(() => {
    jest.setSystemTime(NOW);
  });

  it('places each install one interval after the previous one', () => {
    const reservation = { startsAt: NOW + 5_000, deploymentIntervalMs: 1_000 };

    expect(
      [0, 1, 2].map((deploymentIndex) =>
        getDeploymentDelayMs({ reservation, deploymentIndex }),
      ),
    ).toEqual([5_000, 6_000, 7_000]);
  });

  it('never returns a negative delay once the slot has passed', () => {
    expect(
      getDeploymentDelayMs({
        reservation: { startsAt: NOW - 5_000, deploymentIntervalMs: 1_000 },
        deploymentIndex: 1,
      }),
    ).toBe(0);
  });
});
