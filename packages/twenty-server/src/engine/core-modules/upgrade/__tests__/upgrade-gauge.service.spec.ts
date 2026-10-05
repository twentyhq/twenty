import { UpgradeHealthEnum } from 'twenty-shared/types';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import {
  type InstanceAndWorkspaceCountsUpgradeStatus,
  type UpgradeStatusService,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { UpgradeGaugeService } from 'src/engine/core-modules/upgrade/upgrade-gauge.service';

const UPGRADE_STATUS: InstanceAndWorkspaceCountsUpgradeStatus = {
  instanceUpgradeStatus: {
    inferredVersion: '2.47.0',
    health: UpgradeHealthEnum.UP_TO_DATE,
    latestCommand: null,
  },
  behindWorkspaceCount: 2,
  failedWorkspaceCount: 1,
  upToDateWorkspaceCount: 10,
  computedAt: new Date('2026-10-05T12:00:00Z'),
};

describe('UpgradeGaugeService', () => {
  let gaugeCallbacks: Record<string, () => Promise<number>>;
  let getInstanceAndWorkspaceCountsStatus: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    gaugeCallbacks = {};
    getInstanceAndWorkspaceCountsStatus = jest.fn();

    const metricsService = {
      createObservableGauge: jest.fn(({ metricName, callback }) => {
        gaugeCallbacks[metricName] = callback;
      }),
      createInfoGauge: jest.fn(),
    } as unknown as MetricsService;

    new UpgradeGaugeService(metricsService, {
      getInstanceAndWorkspaceCountsStatus,
    } as unknown as UpgradeStatusService).onModuleInit();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should keep the last known value while another pod refreshes', async () => {
    getInstanceAndWorkspaceCountsStatus.mockResolvedValueOnce(UPGRADE_STATUS);

    const behindGauge =
      gaugeCallbacks['twenty_upgrade_workspaces_behind_total'];

    expect(await behindGauge()).toBe(2);

    jest.advanceTimersByTime(61_000);
    getInstanceAndWorkspaceCountsStatus.mockResolvedValue(null);

    expect(await behindGauge()).toBe(2);
    expect(await behindGauge()).toBe(2);
    expect(getInstanceAndWorkspaceCountsStatus).toHaveBeenCalledTimes(3);
  });

  it('should report unknown health before any status was computed', async () => {
    getInstanceAndWorkspaceCountsStatus.mockResolvedValue(null);

    expect(await gaugeCallbacks['twenty_upgrade_instance_health']()).toBe(-2);
  });
});
