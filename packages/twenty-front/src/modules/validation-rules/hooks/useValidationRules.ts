import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from 'twenty-shared/utils';

import { FindManyValidationRulesDocument } from '~/generated-metadata/graphql';

export const useValidationRules = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { data, loading, refetch } = useQuery(FindManyValidationRulesDocument, {
    variables: { objectMetadataId },
    skip: !isNonEmptyString(objectMetadataId),
  });

  return {
    validationRules: data?.validationRules ?? [],
    loading,
    refetchValidationRules: refetch,
  };
};
