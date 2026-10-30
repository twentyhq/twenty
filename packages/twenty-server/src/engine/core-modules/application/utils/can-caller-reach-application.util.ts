import { type ApplicationCallerAccess } from 'src/engine/core-modules/application/types/application-caller-access.type';
import { getReachableApplications } from 'src/engine/core-modules/application/utils/get-reachable-applications.util';

export const canCallerReachApplication = ({
  applicationId,
  ...callerAccess
}: ApplicationCallerAccess & {
  applicationId: string | null | undefined;
}): boolean => {
  const reachableApplications = getReachableApplications(callerAccess);

  return (
    reachableApplications.type === 'all' ||
    reachableApplications.applicationId === applicationId
  );
};
