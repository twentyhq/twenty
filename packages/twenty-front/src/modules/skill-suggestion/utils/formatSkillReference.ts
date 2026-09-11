// Skill names are free-form, so a name with whitespace is quoted to keep
// the reference unambiguous for the agent's exact-name skill lookup.
export const formatSkillReference = (skillName: string): string =>
  /\s/.test(skillName) ? `/"${skillName}"` : `/${skillName}`;
