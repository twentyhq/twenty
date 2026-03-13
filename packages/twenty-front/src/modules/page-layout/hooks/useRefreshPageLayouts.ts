import { useApplyPageLayouts } from '@/page-layout/hooks/useApplyPageLayouts';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useApolloClient } from '@apollo/client/react';
import { FindAllPageLayoutsDocument } from '~/generated-metadata/graphql';

export const useRefreshPageLayouts = () => {
  const client = useApolloClient();

  const { applyPageLayouts } = useApplyPageLayouts();

  const refreshPageLayouts = useCallback(async () => {
    const result = await client.query({
      query: FindAllPageLayoutsDocument,
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.getPageLayouts)) {
      return;
    }

    applyPageLayouts(result.data.getPageLayouts);
  }, [client, applyPageLayouts]);

  return {
    refreshPageLayouts,
  };
};
