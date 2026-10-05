import { useQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import { isNonEmptyString } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
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
    context: { queryDeduplication: false },
  });

  const refetchLatestValidationRules = useDebouncedCallback(() => {
    void refetch();
  }, 0);

  const refetchOnValidationRuleOperation = useCallback(
    ({ operation }: MetadataOperationBrowserEventDetail<ValidationRule>) => {
      if (
        shouldRefetchValidationRulesOnOperation({
          operation,
          objectMetadataId,
          validationRules: data?.validationRules ?? [],
        })
      ) {
        refetchLatestValidationRules();
      }
    },
    [data, objectMetadataId, refetchLatestValidationRules],
  );

  useListenToMetadataOperationBrowserEvent<ValidationRule>({
    metadataName: AllMetadataName.validationRule,
    onMetadataOperationBrowserEvent: refetchOnValidationRuleOperation,
    skip,
  });

  const refetchOnSseReconnected = useCallback(() => {
    if (!skip) {
      refetchLatestValidationRules();
    }
  }, [refetchLatestValidationRules, skip]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refetchOnSseReconnected,
  });

  return {
    validationRules: data?.validationRules ?? [],
    loading,
    refetchValidationRules: refetch,
  };
};
