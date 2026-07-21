import { defineRole } from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export const SELLER_ROLE_UNIVERSAL_IDENTIFIER =
  'f034a868-8acc-4aa9-8c1d-86eba3d89fbf';

const readOnly = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

export default defineRole({
  universalIdentifier: SELLER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Seller',
  description: 'Read-only access to their listing and its showings',
  icon: 'IconUserDollar',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    { objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER, ...readOnly },
    { objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER, ...readOnly },
  ],
});
