import { useApplyPageLayouts } from '@/page-layout/hooks/useApplyPageLayouts';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useFindAllPageLayoutsLazyQuery } from '~/generated-metadata/graphql';

export const useRefreshPageLayouts = () => {
  const [findAllPageLayoutsLazy] = useFindAllPageLayoutsLazyQuery();

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
