import { useApplications } from '@/applications/hooks/useApplications';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { isDefined } from 'twenty-shared/utils';

export const useApplicationFromStore = ({
  applicationId,
  universalIdentifier,
}: {
  applicationId?: string;
  universalIdentifier?: string;
}): {
  application: FlatApplication | undefined;
  isApplicationsStoreReady: boolean;
} => {
  const { applications, isApplicationsStoreReady } = useApplications();

  const application = applications.find(
    (storedApplication) =>
      (isDefined(applicationId) && storedApplication.id === applicationId) ||
      (isDefined(universalIdentifier) &&
        storedApplication.universalIdentifier === universalIdentifier),
  );

  return { application, isApplicationsStoreReady };
};
