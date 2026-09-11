import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { FindManySkillsForSuggestionDocument } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

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

      const normalizedQuery = normalizeSearchText(query);

      return (data?.skills ?? [])
        .filter(
          (skill) =>
            skill.isActive &&
            (normalizeSearchText(skill.name).includes(normalizedQuery) ||
              normalizeSearchText(skill.label).includes(normalizedQuery)),
        )
        .sort((skillA, skillB) => skillA.label.localeCompare(skillB.label))
        .map((skill) => ({
          name: skill.name,
          label: skill.label,
          icon: skill.icon ?? null,
        }));
    },
    [apolloMetadataClient],
  );

  return { searchSkills };
};
