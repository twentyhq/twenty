import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';

import {
  FeatureFlagKey,
  GettingStartedProgressDocument,
} from '~/generated-metadata/graphql';

export const useGettingStartedProgress = ({
  isEnabled = true,
}: {
  isEnabled?: boolean;
} = {}) => {
  const isGettingStartedEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_GETTING_STARTED_ENABLED,
  );

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
