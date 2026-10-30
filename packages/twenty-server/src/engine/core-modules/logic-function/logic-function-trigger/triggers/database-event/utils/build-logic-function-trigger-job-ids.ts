import { type LogicFunctionTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';

export const buildLogicFunctionTriggerJobIds = ({
  triggerJobId,
  logicFunctionPayloads,
}: {
  triggerJobId: string;
  logicFunctionPayloads: Pick<LogicFunctionTriggerJobData, 'logicFunctionId'>[];
}): string[] => {
  const chunkCountByLogicFunctionId = new Map<string, number>();

  return logicFunctionPayloads.map(({ logicFunctionId }) => {
    const chunkIndex = chunkCountByLogicFunctionId.get(logicFunctionId) ?? 0;

    chunkCountByLogicFunctionId.set(logicFunctionId, chunkIndex + 1);

    return `${triggerJobId}.${logicFunctionId}.${chunkIndex}`;
  });
};
