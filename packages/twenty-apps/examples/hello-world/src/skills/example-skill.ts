import { defineSkill } from 'twenty-sdk';

export const EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER =
  '90cf9144-4811-4653-93a2-9a6780fe6aac';

export default defineSkill({
  universalIdentifier: EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'example-skill',
  label: 'Example Skill',
  description: 'A sample skill for your application',
  icon: 'IconBrain',
  content: 'Add your skill instructions here. Skills provide context and capabilities to AI agents.',
});
