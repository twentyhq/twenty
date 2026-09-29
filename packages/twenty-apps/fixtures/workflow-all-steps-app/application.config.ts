import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './my.role';

export default defineApplication({
  universalIdentifier: '7efc7ab1-b7c2-5a4d-a61f-8a684f6d26cd',
  displayName: 'Workflow step gallery',
  description: 'A visual example with all 20 workflow action types',
  icon: 'IconSettingsAutomation',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
