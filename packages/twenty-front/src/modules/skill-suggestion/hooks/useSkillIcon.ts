import { useQuery } from '@apollo/client/react';

import { FindManySkillsForSuggestionDocument } from '~/generated-metadata/graphql';

// Skill references only carry an id and a label, so the icon comes from the
// cached skill catalog; the query is skipped when no skill is referenced.
export const useSkillIcon = (skillId: string | null): string | null => {
  const { data } = useQuery(FindManySkillsForSuggestionDocument, {
    skip: skillId === null,
    fetchPolicy: 'cache-first',
  });

  const skill = data?.skills.find((candidate) => candidate.id === skillId);

  return skill?.icon ?? null;
};
