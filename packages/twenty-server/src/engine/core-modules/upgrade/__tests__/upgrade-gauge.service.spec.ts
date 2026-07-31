import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { UpgradeGaugeService } from 'src/engine/core-modules/upgrade/upgrade-gauge.service';
import { UpgradeHealthEnum } from 'twenty-shared/types';

describe('UpgradeGaugeService', () => {
  it('collects workspace counts without hydrating workspace names', async () => {
    const createObservableGauge = jest.fn();
    const createInfoGauge = jest.fn();
    const getInstanceAndWorkspaceCountsStatus = jest.fn().mockResolvedValue({
      instanceUpgradeStatus: {
        inferredVersion: 'v1.2.3',
        health: UpgradeHealthEnum.UP_TO_DATE,
        latestCommand: null,
      },
      behindWorkspaceCount: 2,
      failedWorkspaceCount: 1,
      upToDateWorkspaceCount: 5,
      computedAt: new Date(),
    });
    const service = new UpgradeGaugeService(
      {
        createObservableGauge,
        createInfoGauge,
      } as unknown as MetricsService,
      {
        getInstanceAndWorkspaceCountsStatus,
      } as unknown as UpgradeStatusService,
    );

    service.onModuleInit();

    const behindGaugeCallback = createObservableGauge.mock.calls.find(
      ([options]) =>
        options.metricName === 'twenty_upgrade_workspaces_behind_total',
    )?.[0].callback;

    await expect(behindGaugeCallback()).resolves.toBe(2);
    expect(getInstanceAndWorkspaceCountsStatus).toHaveBeenCalledTimes(1);
  });
});
