import { useQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import { isNonEmptyString } from 'twenty-shared/utils';

import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { shouldRefetchValidationRulesOnOperation } from '@/validation-rules/utils/shouldRefetchValidationRulesOnOperation';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  AllMetadataName,
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

  const skip = !isValidationRulesEnabled || !isNonEmptyString(objectMetadataId);

  const { data, loading, refetch } = useQuery(FindManyValidationRulesDocument, {
    variables: { objectMetadataId },
    skip,
    notifyOnNetworkStatusChange: false,
  });

  const refetchOnValidationRuleOperation = useCallback(
    ({ operation }: MetadataOperationBrowserEventDetail<ValidationRule>) => {
      if (
        shouldRefetchValidationRulesOnOperation({
          operation,
          objectMetadataId,
          validationRules: data?.validationRules ?? [],
        })
      ) {
        void refetch();
      }
    },
    [data, objectMetadataId, refetch],
  );

  useListenToMetadataOperationBrowserEvent<ValidationRule>({
    metadataName: AllMetadataName.validationRule,
    onMetadataOperationBrowserEvent: refetchOnValidationRuleOperation,
    skip,
  });

  return {
    validationRules: data?.validationRules ?? [],
    loading,
    refetchValidationRules: refetch,
  };
};
