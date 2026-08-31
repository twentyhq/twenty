import { toFlatApplication } from '@/applications/utils/toFlatApplication';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { applicationsSelector } from '@/metadata-store/states/applicationsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useApolloClient } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindManyApplicationsDocument } from '~/generated-metadata/graphql';

// Applications reach the store through the same SSE pipeline as every other
// broadcast entity, so this only has to fill it once for the pages that read it.
export const useApplications = () => {
  const apolloClient = useApolloClient();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const applicationsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('applications'),
  );
  const applications = useAtomStateValue(applicationsSelector);

  useEffect(() => {
    if (applicationsStoreEntry.status !== 'empty') {
      return;
    }

    apolloClient
      .query({
        query: FindManyApplicationsDocument,
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        if (!isDefined(data?.findManyApplications)) {
          return;
        }

        replaceDraft(
          'applications',
          data.findManyApplications.map(toFlatApplication),
        );
        applyChanges();
      })
      .catch(() => {
        // The store stays empty and the next consumer retries.
      });
  }, [apolloClient, applicationsStoreEntry.status, applyChanges, replaceDraft]);

  return {
    applications,
    isApplicationsStoreReady: applicationsStoreEntry.status !== 'empty',
  };
};
