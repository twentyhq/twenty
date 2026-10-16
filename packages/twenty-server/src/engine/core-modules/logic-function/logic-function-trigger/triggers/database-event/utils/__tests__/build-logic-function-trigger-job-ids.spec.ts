import { buildLogicFunctionTriggerJobIds } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/build-logic-function-trigger-job-ids';

describe('buildLogicFunctionTriggerJobIds', () => {
  it('should number the chunks of each logic function separately', () => {
    expect(
      buildLogicFunctionTriggerJobIds({
        triggerJobId: 'trigger-job-id',
        logicFunctionPayloads: [
          { logicFunctionId: 'logic-function-a' },
          { logicFunctionId: 'logic-function-b' },
          { logicFunctionId: 'logic-function-a' },
        ],
      }),
    ).toEqual([
      'trigger-job-id.logic-function-a.0',
      'trigger-job-id.logic-function-b.0',
      'trigger-job-id.logic-function-a.1',
    ]);
  });

  it('should give each chunk the same id whatever the order of logic functions', () => {
    const buildJobIdSet = (logicFunctionIds: string[]) => {
      const jobIds = buildLogicFunctionTriggerJobIds({
        triggerJobId: 'trigger-job-id',
        logicFunctionPayloads: logicFunctionIds.map((logicFunctionId) => ({
          logicFunctionId,
        })),
      });

      return new Set(jobIds);
    };

    expect(
      buildJobIdSet([
        'logic-function-a',
        'logic-function-a',
        'logic-function-b',
      ]),
    ).toEqual(
      buildJobIdSet([
        'logic-function-b',
        'logic-function-a',
        'logic-function-a',
      ]),
    );
  });
});
