import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageConsumptionWindow } from 'src/engine/core-modules/usage/types/usage-consumption-window.type';
import { buildConsumptionRowsByWindowQuery } from 'src/engine/core-modules/usage/utils/build-consumption-rows-by-window-query.util';

const buildWindow = (
  overrides: Partial<UsageConsumptionWindow> = {},
): UsageConsumptionWindow => ({
  windowKey: 'month:1',
  resourceTypes: [UsageResourceType.AI],
  periodStart: new Date('2026-09-01T00:00:00.000Z'),
  periodEnd: new Date('2026-10-01T00:00:00.000Z'),
  periodAnchor: 'calendar',
  ...overrides,
});

describe('buildConsumptionRowsByWindowQuery', () => {
  it('emits one branch per window with its own parameters', () => {
    const { query, params } = buildConsumptionRowsByWindowQuery([
      buildWindow(),
      buildWindow({
        windowKey: 'week:1',
        resourceTypes: [UsageResourceType.AI, UsageResourceType.APP],
        periodStart: new Date('2026-09-07T00:00:00.000Z'),
        periodEnd: new Date('2026-09-14T00:00:00.000Z'),
      }),
    ]);

    expect(query.split('UNION ALL')).toHaveLength(2);
    expect(query).toContain('{resourceTypes0:Array(String)}');
    expect(query).toContain('{periodStart1:DateTime64(3)}');
    expect(params).toEqual({
      windowKey0: 'month:1',
      resourceTypes0: [UsageResourceType.AI],
      periodStart0: '2026-09-01 00:00:00.000',
      periodEnd0: '2026-10-01 00:00:00.000',
      windowKey1: 'week:1',
      resourceTypes1: [UsageResourceType.AI, UsageResourceType.APP],
      periodStart1: '2026-09-07 00:00:00.000',
      periodEnd1: '2026-09-14 00:00:00.000',
    });
  });

  it('groups each branch on the projection keys', () => {
    const { query } = buildConsumptionRowsByWindowQuery([buildWindow()]);

    expect(query).toContain(
      `GROUP BY resourceType, operationType, userWorkspaceId, apiKeyId,
              applicationId, agentId, workflowId, logicFunctionId`,
    );
  });

  it('anchors an allowance window on the stamped billing period', () => {
    const { query } = buildConsumptionRowsByWindowQuery([
      buildWindow({ periodAnchor: 'billing' }),
    ]);

    expect(query).toContain('AND periodStart = {periodStart0:DateTime64(3)}');
  });
});
