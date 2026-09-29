import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from 'twenty-shared/utils';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  FindManyValidationRulesDocument,
} from '~/generated-metadata/graphql';

export const useValidationRules = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const isValidationRulesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
  );

  const { data, loading, refetch } = useQuery(FindManyValidationRulesDocument, {
    variables: { objectMetadataId },
    skip: !isValidationRulesEnabled || !isNonEmptyString(objectMetadataId),
  });

  return {
    validationRules: data?.validationRules ?? [],
    loading,
    refetchValidationRules: refetch,
  };
};
