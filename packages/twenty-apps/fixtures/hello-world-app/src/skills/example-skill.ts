import { defineSkill } from 'twenty-sdk';

export const EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER =
  'd0940029-9d3c-40be-903a-52d65393028f';

export default defineSkill({
  universalIdentifier: EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'example-skill',
  label: 'Example Skill',
  description: 'A sample skill for your application',
  icon: 'IconBrain',
  content: 'Add your skill instructions here. Skills provide context and capabilities to AI agents.',
});
