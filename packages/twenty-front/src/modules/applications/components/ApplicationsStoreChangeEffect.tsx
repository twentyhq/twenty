import { useApplications } from '@/applications/hooks/useApplications';
import { useEffect, useState } from 'react';

type ApplicationsStoreChangeEffectProps = {
  onApplicationsStoreChange: () => void;
};

// The store holds the application rows the SSE events carry; everything derived
// from them — relations, logos, the workspace payload — is re-read by the page
// that needs it when one of those rows appears, changes or disappears.
export const ApplicationsStoreChangeEffect = ({
  onApplicationsStoreChange,
}: ApplicationsStoreChangeEffectProps) => {
  const { applications, isApplicationsStoreReady } = useApplications();

  const applicationsSignature = applications
    .map(
      (application) =>
        `${application.id}:${application.state}:${application.version ?? ''}`,
    )
    .sort()
    .join('|');

  const [observedApplicationsSignature, setObservedApplicationsSignature] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isApplicationsStoreReady) {
      return;
    }

    if (observedApplicationsSignature === applicationsSignature) {
      return;
    }

    setObservedApplicationsSignature(applicationsSignature);

    // The first snapshot is the one the page already rendered from.
    if (observedApplicationsSignature === null) {
      return;
    }

    onApplicationsStoreChange();
  }, [
    applicationsSignature,
    isApplicationsStoreReady,
    observedApplicationsSignature,
    onApplicationsStoreChange,
  ]);

  return null;
};
