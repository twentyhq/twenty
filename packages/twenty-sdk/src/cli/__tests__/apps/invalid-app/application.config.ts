import { defineApplication } from '@/sdk';

export default defineApplication({
  universalIdentifier: 'invalid-app-0000-0000-0000-000000000001',
  displayName: 'Invalid App',
  description: 'An app with duplicate IDs for testing validation',
  icon: 'IconAlertTriangle',
  defaultRoleUniversalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000002',
});
