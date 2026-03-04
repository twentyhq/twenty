import { defineSkill } from 'twenty-sdk';

export const EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER =
  '4f00dd76-c07b-4d55-a43a-7f17e7f6440a';

export default defineSkill({
  universalIdentifier: EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'example-skill',
  label: 'Example Skill',
  description: 'A sample skill for your application',
  icon: 'IconBrain',
  content: 'Add your skill instructions here. Skills provide context and capabilities to AI agents.',
});
