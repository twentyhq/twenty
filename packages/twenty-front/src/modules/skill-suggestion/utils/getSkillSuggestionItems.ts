import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { type FindManySkillsForSuggestionQuery } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const getSkillSuggestionItems = ({
  skills,
  query,
}: {
  skills: FindManySkillsForSuggestionQuery['skills'];
  query: string;
}): SkillSuggestionItem[] => {
  const normalizedQuery = normalizeSearchText(query.trim());

  return skills
    .filter(
      (skill) =>
        skill.isActive &&
        !skill.isSystem &&
        (normalizeSearchText(skill.name).includes(normalizedQuery) ||
          normalizeSearchText(skill.label).includes(normalizedQuery)),
    )
    .sort((skillA, skillB) => skillA.label.localeCompare(skillB.label))
    .map((skill) => ({
      id: skill.id,
      name: skill.name,
      label: skill.label,
      description: skill.description ?? null,
      icon: skill.icon ?? null,
    }));
};
