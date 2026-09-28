import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { getSkillSuggestionItems } from '@/skill-suggestion/utils/getSkillSuggestionItems';
import { FindManySkillsForSuggestionDocument } from '~/generated-metadata/graphql';

export const useSkillSuggestionSearch = () => {
  const apolloMetadataClient = useApolloClient();

  const searchSkills = useCallback(
    async (query: string): Promise<SkillSuggestionItem[]> => {
      // Settings can delete or deactivate a skill without refetching the
      // catalog, so the list is refreshed when the menu opens (empty query)
      // and served from cache while the user narrows it down.
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
