import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineRole } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// PLACEHOLDER role for external partners. Twenty has no row-level filtering yet,
// so anyone assigned this role currently sees every record — do not hand out
// until RLP ships and we can scope to records owned by the assigned user.
export default defineRole({
  universalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Partner',
  description:
    'PLACEHOLDER. External partner self-service role. Sees ALL Partner/Opportunity records today because Twenty does not yet support row-level record filtering. When RLP ships, scope these permissions to records owned by the assigned user. DO NOT assign to real external partners until then.',
  icon: 'IconBuildingStore',
  canBeAssignedToUsers: true,
  canUpdateAllSettings: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
