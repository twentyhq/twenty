import { defineAgent } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from '../../my.role';

export const DEMO_AGENT_UNIVERSAL_IDENTIFIER =
  '0205f5bf-ce54-5988-a535-2fbf64ecaef5';

export default defineAgent({
  universalIdentifier: DEMO_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'workflow-step-gallery-agent',
  label: 'Workflow demo agent',
  description: 'Summarizes fictional companies in the all-step-types workflow.',
  icon: 'IconRobot',
  prompt:
    'You are a demo assistant. Reply in one short sentence. Do not use tools or change records.',
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
