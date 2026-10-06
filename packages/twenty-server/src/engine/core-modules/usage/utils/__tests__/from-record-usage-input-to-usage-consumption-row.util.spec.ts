import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';

const WORKFLOW_ID = '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f';
const APPLICATION_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const workflowEvent: RecordUsageInput = {
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
};

describe('fromRecordUsageInputToUsageConsumptionRow', () => {
  it('writes each spender in its column, empty when the spender is absent', () => {
    expect(fromRecordUsageInputToUsageConsumptionRow(workflowEvent)).toEqual({
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
    ['invalid', -5],
  ])('stores %s credits as zero', (_case, creditsUsedMicro) => {
    expect(
      fromRecordUsageInputToUsageConsumptionRow({
        ...workflowEvent,
        creditsUsedMicro,
      }).creditsUsedMicro,
    ).toBe(0);
  });
});
