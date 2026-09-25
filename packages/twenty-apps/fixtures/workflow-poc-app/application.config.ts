import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './my.role';

export default defineApplication({
  universalIdentifier: '796c907d-e980-464c-bdd2-55aa58f274e4',
  displayName: 'Workflow POC',
  description: 'An application-owned workflow with one updatable version',
  icon: 'IconSettingsAutomation',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
