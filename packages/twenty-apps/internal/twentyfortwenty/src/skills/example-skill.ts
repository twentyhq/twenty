import { defineSkill } from 'twenty-sdk';

export const EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER =
  '163ff05a-e5ed-440c-8b14-d5137121146d';

export default defineSkill({
  universalIdentifier: EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'example-skill',
  label: 'Example Skill',
  description: 'A sample skill for your application',
  icon: 'IconBrain',
  content: 'Add your skill instructions here. Skills provide context and capabilities to AI agents.',
});
