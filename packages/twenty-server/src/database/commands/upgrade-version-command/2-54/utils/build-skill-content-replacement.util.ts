import { isDefined } from 'twenty-shared/utils';

import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

// Content edited by the workspace before skills became overridable lives on the row, so it is left alone
export const buildSkillContentReplacement = ({
  skill,
  fromContent,
  toContent,
}: {
  skill: FlatSkill | undefined;
  fromContent: string;
  toContent: string;
}): FlatSkill | undefined =>
  isDefined(skill) && skill.content === fromContent
    ? { ...skill, content: toContent }
    : undefined;
