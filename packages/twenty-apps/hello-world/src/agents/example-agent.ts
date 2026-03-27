import { defineAgent } from 'twenty-sdk';

export const EXAMPLE_AGENT_UNIVERSAL_IDENTIFIER =
  '110bebc2-f116-46b6-a35d-61e91c3c0a43';

export default defineAgent({
  universalIdentifier: EXAMPLE_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'example-agent',
  label: 'Example Agent',
  description: 'A sample AI agent for your application',
  icon: 'IconRobot',
  prompt: 'You are a helpful assistant. Help users with their questions and tasks.',
});
