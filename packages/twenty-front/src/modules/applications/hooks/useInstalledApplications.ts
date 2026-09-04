import { useRefetchOnApplicationLifecycleSettled } from '@/applications/hooks/useRefetchOnApplicationLifecycleSettled';
import { useRefetchOnApplicationRegistrationChange } from '@/applications/hooks/useRefetchOnApplicationRegistrationChange';
import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import {
  ApplicationState,
  FindManyApplicationsDocument,
} from '~/generated-metadata/graphql';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';

export const useInstalledApplications = (): ApplicationWithoutRelation[] => {
  const { data, refetch } = useQuery(FindManyApplicationsDocument);

  useRefetchOnApplicationLifecycleSettled({ refetch });
  useRefetchOnApplicationRegistrationChange({ refetch });

  const applications = useAtomStateValue(applicationsSelector);

  const queriedApplicationsById = new Map(
    (data?.findManyApplications ?? []).map((application) => [
      application.id,
      application,
    ]),
  );

  return applications
    .filter((application) => application.state !== ApplicationState.FAILED)
    .map((application) => {
      const queriedApplication = queriedApplicationsById.get(application.id);

      return {
        ...application,
        logoUrl: queriedApplication?.logoUrl,
        applicationRegistration: queriedApplication?.applicationRegistration,
      };
    });
};
