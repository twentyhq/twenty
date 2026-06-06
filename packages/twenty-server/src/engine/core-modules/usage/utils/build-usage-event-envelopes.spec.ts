import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { buildUsageEventEnvelopes } from 'src/engine/core-modules/usage/utils/build-usage-event-envelopes';

const usageEvent = (overrides: Partial<UsageEvent> = {}): UsageEvent => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  quantity: 1500,
  unit: UsageUnit.TOKEN,
  creditsUsedMicro: 7500,
  ...overrides,
});

describe('buildUsageEventEnvelopes', () => {
  it('maps each usage event to a usageEvent envelope carrying the workspace + columns', () => {
    const envelopes = buildUsageEventEnvelopes('ws-1', [
      usageEvent({
        userWorkspaceId: 'uw-1',
        resourceId: 'agent-1',
        resourceContext: 'gpt-4o',
      }),
    ]);

    expect(envelopes).toHaveLength(1);
    expect(envelopes[0].table).toBe('usageEvent');
    expect(envelopes[0].row).toMatchObject({
      workspaceId: 'ws-1',
      userWorkspaceId: 'uw-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      quantity: 1500,
      creditsUsedMicro: 7500,
      resourceId: 'agent-1',
      resourceContext: 'gpt-4o',
    });
  });

  it('defaults the optional string columns to empty and omits periodStart when absent', () => {
    const [envelope] = buildUsageEventEnvelopes('ws-1', [usageEvent()]);

    expect(envelope.row).toMatchObject({
      userWorkspaceId: '',
      resourceId: '',
      resourceContext: '',
    });
    expect(
      (envelope.row as { periodStart?: string }).periodStart,
    ).toBeUndefined();
  });

  it('formats periodStart for ClickHouse when present', () => {
    const [envelope] = buildUsageEventEnvelopes('ws-1', [
      usageEvent({ periodStart: new Date('2026-01-01T00:00:00.000Z') }),
    ]);

    expect((envelope.row as { periodStart?: string }).periodStart).toBe(
      '2026-01-01 00:00:00.000',
    );
  });
});
