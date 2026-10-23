import { useApolloClient } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';

export const useRefreshFrontComponents = () => {
  const client = useApolloClient();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const refreshFrontComponents = async () => {
    try {
      await client.query({
        query: FIND_MANY_FRONT_COMPONENTS,
        fetchPolicy: 'network-only',
      });

      await loadStaleMetadataEntities(['frontComponents']);
    } catch {
      enqueueToast({
        children: t`Could not refresh components. Reload to see saved changes.`,
        status: 'error',
      });
    }
  };

  return { refreshFrontComponents };
};
