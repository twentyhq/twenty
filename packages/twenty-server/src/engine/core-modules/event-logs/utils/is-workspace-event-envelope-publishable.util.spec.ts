import { type UsageEventRow } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { isWorkspaceEventEnvelopePublishable } from 'src/engine/core-modules/event-logs/utils/is-workspace-event-envelope-publishable.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildUsageEventRow = (
  operationType: UsageOperationType,
): UsageEventRow => ({
  timestamp: '2026-10-07 12:00:00.000',
  workspaceId: 'workspace-1',
  userWorkspaceId: 'user-workspace-1',
  resourceType: UsageResourceType.AI,
  operationType,
  quantity: 1_000,
  unit: UsageUnit.TOKEN,
  creditsUsedMicro: 9_000,
  resourceId: 'agent-1',
  resourceContext: 'model-1',
  metadata: {},
});

describe('isWorkspaceEventEnvelopePublishable', () => {
  it('publishes billable usage', () => {
    expect(
      isWorkspaceEventEnvelopePublishable({
        table: 'usageEvent',
        row: buildUsageEventRow(UsageOperationType.AI_CHAT_TOKEN),
      }),
    ).toBe(true);
  });

  it('holds back included chat usage', () => {
    expect(
      isWorkspaceEventEnvelopePublishable({
        table: 'usageEvent',
        row: buildUsageEventRow(UsageOperationType.AI_CHAT_INCLUDED),
      }),
    ).toBe(false);
  });

  it('publishes an event of another table', () => {
    expect(
      isWorkspaceEventEnvelopePublishable({
        table: 'applicationLog',
        row: {
          timestamp: '2026-10-07 12:00:00.000',
          workspaceId: 'workspace-1',
          applicationId: 'application-1',
          logicFunctionId: 'logic-function-1',
          logicFunctionName: 'sync',
          executionId: 'execution-1',
          level: 'info',
          message: 'Synced 3 records',
        },
      }),
    ).toBe(true);
  });
});
