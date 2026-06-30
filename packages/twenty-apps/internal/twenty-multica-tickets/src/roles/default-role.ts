import { defineRole } from 'twenty-sdk/define';
import { DEFAULT_ROLE_ID } from 'src/constants/universal-identifiers';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_ID,
  label: 'Multica Support automation role',
  description:
    'Default role for Multica Support ticket sync and automation functions.',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: true,
});
