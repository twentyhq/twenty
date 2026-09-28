import { defineLogicFunction } from 'twenty-sdk/define';

export const GREET_UNIVERSAL_IDENTIFIER =
  'ab15b078-9c5d-52e0-a9e9-27aaa4ec11f8';

const handler = async ({ greeting }: { greeting: string }) => ({ greeting });

export default defineLogicFunction({
  universalIdentifier: GREET_UNIVERSAL_IDENTIFIER,
  name: 'greet',
  timeoutSeconds: 5,
  handler,
  workflowActionTriggerSettings: { label: 'Greet', icon: 'IconHandStop' },
});
