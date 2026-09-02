import { Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
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
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(false) },
        },
        {
          provide: DiscoveryService,
          useValue: { getProviders: () => [] },
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
});
