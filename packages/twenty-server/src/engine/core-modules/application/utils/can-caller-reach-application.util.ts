import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { getReachableApplications } from 'src/engine/core-modules/application/utils/get-reachable-applications.util';

export const canCallerReachApplication = ({
  applicationId,
  ...callerOperation
}: ApplicationCallerOperation & {
  applicationId: string | null | undefined;
}): boolean => {
  const reachableApplications = getReachableApplications(callerOperation);

  return (
    reachableApplications.type === 'all' ||
    reachableApplications.applicationId === applicationId
  );
};
