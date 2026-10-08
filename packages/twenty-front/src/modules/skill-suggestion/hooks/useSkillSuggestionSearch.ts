import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { getSkillSuggestionItems } from '@/skill-suggestion/utils/getSkillSuggestionItems';
import { FindManySkillsForSuggestionDocument } from '~/generated-metadata/graphql';

export const useSkillSuggestionSearch = () => {
  const apolloMetadataClient = useApolloClient();

  const searchSkills = useCallback(
    async (query: string): Promise<SkillSuggestionItem[]> => {
      // Settings can delete or deactivate a skill without refetching, so refresh on open (empty query) and cache while narrowing
      const { data } = await apolloMetadataClient.query({
        query: FindManySkillsForSuggestionDocument,
        fetchPolicy: query === '' ? 'network-only' : 'cache-first',
      });

      return getSkillSuggestionItems({ skills: data?.skills ?? [], query });
    },
    [apolloMetadataClient],
  );

  return { searchSkills };
};
