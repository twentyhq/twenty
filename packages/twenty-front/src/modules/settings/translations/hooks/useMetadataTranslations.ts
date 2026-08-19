import { useQuery } from '@apollo/client/react';
import {
  type MetadataTranslationsInput,
  MetadataTranslationsDocument,
} from '~/generated-metadata/graphql';

export const useMetadataTranslations = (
  input: MetadataTranslationsInput | null,
) => {
  const { data, loading, refetch } = useQuery(MetadataTranslationsDocument, {
    variables: { input: input ?? {} },
    skip: input === null,
    fetchPolicy: 'cache-and-network',
  });

  return {
    metadataTranslations: data?.metadataTranslations ?? [],
    loading,
    refetch,
  };
};
