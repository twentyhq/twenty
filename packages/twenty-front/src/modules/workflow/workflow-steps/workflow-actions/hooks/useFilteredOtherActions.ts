import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';
import { OTHER_ACTIONS } from '../constants/OtherActions';

export const useFilteredOtherActions = () => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  return OTHER_ACTIONS.filter((action) => {
    return action.type !== 'AI_AGENT' || isAiEnabled;
  });
};
