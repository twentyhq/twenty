import { useQuery } from '@apollo/client/react';

import { FindManyValidationRulesDocument } from '~/generated-metadata/graphql';

export const useValidationRules = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { data, loading, refetch } = useQuery(FindManyValidationRulesDocument, {
    variables: { objectMetadataId },
  });

  return {
    validationRules: data?.validationRules ?? [],
    loading,
    refetchValidationRules: refetch,
  };
};
