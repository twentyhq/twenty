import { randomUUID } from 'node:crypto';
import { defineLogicFunction } from 'twenty-sdk/define';

export const PREPARE_DEMO_UNIVERSAL_IDENTIFIER =
  'dfa07733-8e1b-5186-9fb8-dd64e55ea891';

const handler = async ({ companyName }: { companyName: string }) => ({
  companyName: `${companyName} — ${randomUUID().slice(0, 8)}`,
  summaryPrompt: `Describe the fictional demo company ${companyName} in one sentence. Do not use tools or modify records.`,
});

export default defineLogicFunction({
  universalIdentifier: PREPARE_DEMO_UNIVERSAL_IDENTIFIER,
  name: 'prepare-demo',
  timeoutSeconds: 5,
  handler,
});
