import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import {
  type UsageEventRow,
  type WorkspaceEventEnvelope,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const API_REQUEST: RecordUsageInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  quantity: 1,
  unit: UsageUnit.REQUEST,
};

describe('UsageRecorderService', () => {
  let recorder: UsageRecorderService;
  let dispatch: jest.Mock;

  const dispatchedRows = (): UsageEventRow[] =>
    dispatch.mock.calls
      .flatMap((call) => call[0] as WorkspaceEventEnvelope[])
      .map((envelope) => envelope.row as UsageEventRow);

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    dispatch = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageRecorderService,
        {
          provide: EventLogEmitterService,
          useValue: { dispatch, isEnabled: jest.fn().mockReturnValue(true) },
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: { emitCustomBatchEvent: jest.fn() },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { getOrRecompute: jest.fn() },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(false) },
        },
      ],
    }).compile();

    recorder = module.get<UsageRecorderService>(UsageRecorderService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dispatches one aggregated batch per workspace on shutdown', async () => {
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-2', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatchedRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ workspaceId: 'ws-1', quantity: 2 }),
        expect.objectContaining({ workspaceId: 'ws-2', quantity: 1 }),
      ]),
    );
  });

  it('re-buffers the counts of a failed dispatch instead of dropping them', async () => {
    dispatch.mockRejectedValueOnce(new Error('clickhouse unreachable'));
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    recorder.accumulate('ws-1', API_REQUEST);
    await recorder.onModuleDestroy();

    expect(dispatchedRows()).toContainEqual(
      expect.objectContaining({ workspaceId: 'ws-1', quantity: 2 }),
    );
  });

  // Available credits are a plain sum over a signed Int64, so a negative amount
  // hands the workspace credits, and a fractional or out-of-range one is not a
  // value that column can hold.
  it.each([
    ['a negative amount', -1_000_000],
    ['negative infinity', Number.NEGATIVE_INFINITY],
    ['positive infinity', Number.POSITIVE_INFINITY],
    ['NaN', Number.NaN],
    ['a fractional amount', 1_000.5],
    ['an amount beyond the safe integer range', Number.MAX_SAFE_INTEGER + 2],
  ])('records zero credits rather than %s', async (_case, creditsUsedMicro) => {
    recorder.accumulate('ws-1', { ...API_REQUEST, creditsUsedMicro });

    await recorder.onModuleDestroy();

    expect(dispatchedRows()).toEqual([
      expect.objectContaining({ workspaceId: 'ws-1', creditsUsedMicro: 0 }),
    ]);
  });

  it('keeps the event so the activity stays visible when its credits are refused', async () => {
    recorder.accumulate('ws-1', { ...API_REQUEST, creditsUsedMicro: -5 });

    await recorder.onModuleDestroy();

    expect(dispatchedRows()).toEqual([
      expect.objectContaining({
        operationType: UsageOperationType.API_REQUEST,
        quantity: 1,
        creditsUsedMicro: 0,
      }),
    ]);
  });

  it('records a positive integer amount unchanged', async () => {
    recorder.accumulate('ws-1', { ...API_REQUEST, creditsUsedMicro: 1_234 });

    await recorder.onModuleDestroy();

    expect(dispatchedRows()).toEqual([
      expect.objectContaining({ creditsUsedMicro: 1_234 }),
    ]);
  });
});
