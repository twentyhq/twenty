import { defineLogicFunction } from 'twenty-sdk/define';

export const GREET_UNIVERSAL_IDENTIFIER =
  'fb9117b7-b009-4fa5-bb68-8ecfe555557a';

const handler = async ({ greeting }: { greeting: string }) => ({ greeting });

export default defineLogicFunction({
  universalIdentifier: GREET_UNIVERSAL_IDENTIFIER,
  name: 'greet',
  timeoutSeconds: 5,
  handler,
  workflowActionTriggerSettings: { label: 'Greet', icon: 'IconHandStop' },
});
