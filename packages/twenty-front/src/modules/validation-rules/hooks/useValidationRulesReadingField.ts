import { useQuery } from '@apollo/client/react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  AllMetadataName,
  FeatureFlagKey,
  FindValidationRulesReadingFieldDocument,
} from '~/generated-metadata/graphql';

export const useValidationRulesReadingField = ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}) => {
  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

  const skip =
    !isRecordCreationFormEnabled || !isNonEmptyString(fieldMetadataId);

  const { data, loading, error, refetch } = useQuery(
    FindValidationRulesReadingFieldDocument,
    {
      variables: { fieldMetadataId },
      fetchPolicy: 'network-only',
      skip,
    },
  );

  useListenToMetadataOperationBrowserEvent<ValidationRule>({
    metadataName: AllMetadataName.validationRule,
    onMetadataOperationBrowserEvent: () => {
      void refetch();
    },
    skip,
  });

  return {
    validationRulesReadingField: data?.validationRulesReadingField ?? [],
    loading,
    hasFailedToLoad: isDefined(error),
  };
};
