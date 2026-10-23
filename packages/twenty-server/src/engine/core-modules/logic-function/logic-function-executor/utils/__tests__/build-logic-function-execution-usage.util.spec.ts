import { isBillingExemptApplication } from 'src/engine/core-modules/application/application-marketplace/utils/is-billing-exempt-application.util';
import { buildLogicFunctionExecutionUsage } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-logic-function-execution-usage.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const LOGIC_FUNCTION_ID = '9f1c2b3a-4d5e-4f60-8a71-b2c3d4e5f607';
const APPLICATION_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const SPENDERS = {
  logicFunctionId: LOGIC_FUNCTION_ID,
  applicationId: APPLICATION_ID,
};

const buildExpectedUsageEvent = ({
  creditsUsedMicro,
  quantity,
  unit,
}: {
  creditsUsedMicro: number;
  quantity: number;
  unit: UsageUnit;
}) => ({
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
  creditsUsedMicro,
  quantity,
  unit,
  resourceId: LOGIC_FUNCTION_ID,
  spenders: SPENDERS,
});

describe('buildLogicFunctionExecutionUsage', () => {
  it.each([
    ['Call Recorder', '8da4b8b5-5edf-4880-b51f-ab6e679ec617'],
    ['Microsoft Teams', '5955f8fe-6724-4749-b770-b849d63d5330'],
  ])(
    'counts a %s run at no credits and no runtime',
    (_, universalIdentifier) => {
      expect(
        buildLogicFunctionExecutionUsage({
          durationMs: 5_000,
          isBillingExempt: isBillingExemptApplication(universalIdentifier),
          resourceId: LOGIC_FUNCTION_ID,
          spenders: SPENDERS,
        }),
      ).toEqual([
        buildExpectedUsageEvent({
          creditsUsedMicro: 0,
          quantity: 1,
          unit: UsageUnit.INVOCATION,
        }),
        buildExpectedUsageEvent({
          creditsUsedMicro: 0,
          quantity: 0,
          unit: UsageUnit.MILLISECOND,
        }),
      ]);
    },
  );
});
