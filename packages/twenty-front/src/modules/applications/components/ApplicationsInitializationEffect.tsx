import { toFlatApplication } from '@/applications/utils/toFlatApplication';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useApolloClient } from '@apollo/client/react';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindManyApplicationsDocument } from '~/generated-metadata/graphql';

// Applications reach the store through the same SSE pipeline as every other
// broadcast entity, so this only has to fill it once — mounted here rather than
// in the hooks that read it, which would each fire their own query.
export const ApplicationsInitializationEffect = () => {
  const apolloClient = useApolloClient();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const applicationsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('applications'),
  );

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
        // The store stays empty and the next mount retries.
      });
  }, [apolloClient, applicationsStoreEntry.status, applyChanges, replaceDraft]);

  return null;
};
