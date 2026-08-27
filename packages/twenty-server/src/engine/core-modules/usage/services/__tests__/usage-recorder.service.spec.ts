import { Logger } from '@nestjs/common';

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

describe('UsageRecorderService', () => {
  let recorder: UsageRecorderService;
  let dispatch: jest.Mock;
  let isEnabled: jest.Mock;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    dispatch = jest.fn().mockResolvedValue(undefined);
    isEnabled = jest.fn().mockReturnValue(true);

    recorder = new UsageRecorderService(
      { emitCustomBatchEvent: jest.fn() } as unknown as WorkspaceEventEmitter,
      { dispatch, isEnabled } as unknown as EventLogEmitterService,
      {} as WorkspaceCacheService,
      {
        get: jest.fn().mockReturnValue(60_000),
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
});
