import { applicationsSelector } from '@/metadata-store/states/applicationsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomValue } from 'jotai';

// ApplicationsInitializationEffect fills the store entry; consumers only read it.
export const useApplications = () => {
  const applicationsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('applications'),
  );
  const applications = useAtomStateValue(applicationsSelector);

  return {
    applications,
    isApplicationsStoreReady: applicationsStoreEntry.status !== 'empty',
  };
};
