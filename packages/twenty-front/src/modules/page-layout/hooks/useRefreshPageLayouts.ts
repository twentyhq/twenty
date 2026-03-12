import { useApplyPageLayouts } from '@/page-layout/hooks/useApplyPageLayouts';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useLazyQuery } from '@apollo/client/react';
import { FindAllPageLayoutsDocument } from '~/generated-metadata/graphql';

export const useRefreshPageLayouts = () => {
  const [findAllPageLayoutsLazy] = useLazyQuery(FindAllPageLayoutsDocument);

  const { applyPageLayouts } = useApplyPageLayouts();

  const refreshPageLayouts = useCallback(async () => {
    const result = await findAllPageLayoutsLazy({
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.getPageLayouts)) {
      return;
    }

    applyPageLayouts(result.data.getPageLayouts);
  }, [findAllPageLayoutsLazy, applyPageLayouts]);

  return {
    refreshPageLayouts,
  };
};
