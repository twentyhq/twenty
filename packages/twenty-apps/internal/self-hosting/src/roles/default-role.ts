import { defineRole } from 'twenty-sdk/define';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export default defineRole({
  universalIdentifier:
    UNIVERSAL_IDENTIFIERS.roles.defaultRole.universalIdentifier,
  label: 'Self hosting default role',
  description: 'Add a description for your role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
