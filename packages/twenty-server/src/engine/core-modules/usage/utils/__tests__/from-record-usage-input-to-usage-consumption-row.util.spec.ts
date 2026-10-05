import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';

const WORKFLOW_ID = '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f';
const APPLICATION_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

describe('fromRecordUsageInputToUsageConsumptionRow', () => {
  it('writes the spender columns, empty when the spender is absent', () => {
    expect(
      fromRecordUsageInputToUsageConsumptionRow({
        resourceType: UsageResourceType.WORKFLOW,
        operationType: UsageOperationType.WORKFLOW_EXECUTION,
        creditsUsedMicro: 100,
        quantity: 1,
        unit: UsageUnit.INVOCATION,
        spenders: {
          workflowId: WORKFLOW_ID,
          applicationId: APPLICATION_ID,
          userWorkspaceId: null,
        },
      }),
    ).toEqual({
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      unit: UsageUnit.INVOCATION,
      userWorkspaceId: '',
      apiKeyId: '',
      applicationId: APPLICATION_ID,
      agentId: '',
      workflowId: WORKFLOW_ID,
      logicFunctionId: '',
      creditsUsedMicro: 100,
      quantity: 1,
    });
  });

  it.each([
    ['missing', undefined],
    ['negative', -5],
    ['fractional', 1.5],
    ['NaN', Number.NaN],
  ])('stores %s credits as zero', (_case, creditsUsedMicro) => {
    expect(
      fromRecordUsageInputToUsageConsumptionRow({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.WEB_SEARCH,
        creditsUsedMicro,
        quantity: 3,
        unit: UsageUnit.INVOCATION,
      }).creditsUsedMicro,
    ).toBe(0);
  });
});
