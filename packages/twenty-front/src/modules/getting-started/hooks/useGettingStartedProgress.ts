import { useIsGettingStartedEnabled } from '@/getting-started/hooks/useIsGettingStartedEnabled';
import { useQuery } from '@apollo/client/react';

import { GettingStartedProgressDocument } from '~/generated-metadata/graphql';

export const useGettingStartedProgress = ({
  isEnabled = true,
}: {
  isEnabled?: boolean;
} = {}) => {
  const isGettingStartedEnabled = useIsGettingStartedEnabled();

  const { data, loading, error, refetch } = useQuery(
    GettingStartedProgressDocument,
    { skip: !isGettingStartedEnabled || !isEnabled },
  );

  return {
    progress: data?.gettingStartedProgress,
    loading,
    error,
    refetch,
  };
};
