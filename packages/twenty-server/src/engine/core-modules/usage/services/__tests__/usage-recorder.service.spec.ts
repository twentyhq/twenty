import { Logger } from '@nestjs/common';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { type EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const API_REQUEST: RecordUsageInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  quantity: 1,
  unit: UsageUnit.REQUEST,
};

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');

describe('UsageRecorderService', () => {
  let recorder: UsageRecorderService;
  let dispatch: jest.Mock;
  let isEnabled: jest.Mock;
  let getOrRecompute: jest.Mock;
  let isBillingEnabled: boolean;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    dispatch = jest.fn().mockResolvedValue(undefined);
    isEnabled = jest.fn().mockReturnValue(true);
    isBillingEnabled = false;
    getOrRecompute = jest.fn().mockResolvedValue({
      currentBillingSubscription: { currentPeriodStart: PERIOD_START },
    });

    recorder = new UsageRecorderService(
      { emitCustomBatchEvent: jest.fn() } as unknown as WorkspaceEventEmitter,
      { dispatch, isEnabled } as unknown as EventLogEmitterService,
      { getOrRecompute } as unknown as WorkspaceCacheService,
      {
        get: jest.fn((key: string) =>
          key === 'IS_BILLING_ENABLED' ? isBillingEnabled : 60_000,
        ),
      } as unknown as TwentyConfigService,
    );
  });

  it('dispatches one batch per workspace on shutdown', async () => {
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-2', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        table: 'usageEvent',
        row: expect.objectContaining({ workspaceId: 'ws-1', quantity: 2 }),
      }),
    ]);
  });

  it('waits for the dispatch to settle before shutdown resolves', async () => {
    let dispatched = false;

    dispatch.mockImplementation(async () => {
      await Promise.resolve();
      dispatched = true;
    });
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(dispatched).toBe(true);
  });

  it('re-buffers the counts of a failed dispatch instead of dropping them', async () => {
    dispatch.mockRejectedValueOnce(new Error('clickhouse unreachable'));
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();
    expect(dispatch).toHaveBeenCalledTimes(1);

    recorder.accumulate('ws-1', API_REQUEST);
    await recorder.onModuleDestroy();

    expect(dispatch.mock.calls[1][0]).toEqual([
      expect.objectContaining({
        row: expect.objectContaining({ quantity: 2 }),
      }),
    ]);
  });

  it('does not buffer anything when usage monitoring is off', async () => {
    isEnabled.mockReturnValue(false);
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('stamps the billing period on accumulated events, once per workspace', async () => {
    isBillingEnabled = true;
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-1', { ...API_REQUEST, unit: UsageUnit.TOKEN });

    await recorder.onModuleDestroy();

    expect(getOrRecompute).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        row: expect.objectContaining({ periodStart: '2026-08-01 00:00:00.000' }),
      }),
      expect.objectContaining({
        row: expect.objectContaining({ periodStart: '2026-08-01 00:00:00.000' }),
      }),
    ]);
  });

  it('leaves the billing period out when the workspace has no subscription', async () => {
    isBillingEnabled = true;
    getOrRecompute.mockResolvedValue({
      currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
    });
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(dispatch.mock.calls[0][0][0].row.periodStart).toBeUndefined();
  });

  it('re-buffers the counts when the billing period lookup fails', async () => {
    isBillingEnabled = true;
    getOrRecompute.mockRejectedValueOnce(new Error('cache unreachable'));
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();
    expect(dispatch).not.toHaveBeenCalled();

    await recorder.onModuleDestroy();

    expect(dispatch.mock.calls[0][0]).toEqual([
      expect.objectContaining({
        row: expect.objectContaining({ quantity: 1 }),
      }),
    ]);
  });
});
