import { type LogicFunction } from '@/logic-functions/types/LogicFunction';
import { isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';

type SortWorkflowActionLogicFunctionsArgs = {
  logicFunctions: LogicFunction[];
  installedApplications: Pick<Application, 'id' | 'createdAt'>[];
};

const getLabel = (logicFunction: LogicFunction): string =>
  logicFunction.workflowActionTriggerSettings?.label ?? logicFunction.name;

export const sortWorkflowActionLogicFunctions = ({
  logicFunctions,
  installedApplications,
}: SortWorkflowActionLogicFunctionsArgs): LogicFunction[] => {
  const applicationCreatedAtTimeById = new Map(
    installedApplications.map((application) => [
      application.id,
      new Date(application.createdAt).getTime(),
    ]),
  );

  const getApplicationCreatedAtTime = (logicFunction: LogicFunction) =>
    isDefined(logicFunction.applicationId)
      ? (applicationCreatedAtTimeById.get(logicFunction.applicationId) ?? 0)
      : 0;

  return [...logicFunctions].sort(
    (logicFunctionA, logicFunctionB) =>
      getApplicationCreatedAtTime(logicFunctionB) -
        getApplicationCreatedAtTime(logicFunctionA) ||
      // Applications installed in the same transaction share createdAt
      (logicFunctionA.applicationId ?? '').localeCompare(
        logicFunctionB.applicationId ?? '',
      ) ||
      getLabel(logicFunctionA).localeCompare(getLabel(logicFunctionB)),
  );
};
