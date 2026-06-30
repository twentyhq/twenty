import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

const GET_WORKSPACE_TRANSLATION_BENCH = gql`
  query GetWorkspaceTranslationBench($locale: String!) {
    workspaceTranslationBench(locale: $locale) {
      key
      applicationId
      source
      shipped
      override
      usageCount
    }
  }
`;

const UPDATE_WORKSPACE_TRANSLATION = gql`
  mutation UpdateWorkspaceTranslation(
    $locale: String!
    $key: String!
    $value: String
  ) {
    updateWorkspaceTranslation(locale: $locale, key: $key, value: $value)
  }
`;

export type WorkspaceTranslationBenchEntry = {
  key: string;
  applicationId: string;
  source: string;
  shipped: string;
  override: string | null;
  usageCount: number;
};

type GetWorkspaceTranslationBenchQueryData = {
  workspaceTranslationBench: WorkspaceTranslationBenchEntry[];
};

export const useWorkspaceTranslationBench = (locale: string) => {
  const { data, loading } = useQuery<GetWorkspaceTranslationBenchQueryData>(
    GET_WORKSPACE_TRANSLATION_BENCH,
    {
      variables: { locale },
      skip: locale === '',
      fetchPolicy: 'cache-and-network',
    },
  );

  const [updateWorkspaceTranslationMutation] = useMutation(
    UPDATE_WORKSPACE_TRANSLATION,
  );

  const updateTranslation = async (key: string, value: string | null) => {
    await updateWorkspaceTranslationMutation({
      variables: { locale, key, value },
    });
  };

  return {
    entries: data?.workspaceTranslationBench ?? [],
    loading,
    updateTranslation,
  };
};
