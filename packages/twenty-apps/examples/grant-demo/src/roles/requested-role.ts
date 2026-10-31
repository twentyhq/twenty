import {
  defineApplicationRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { REQUESTED_ACCESS_VERSION } from 'src/constants/requested-access-version';
import { REQUESTED_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier;

// v1: read companies and all objects. v2: also update companies. v3: drops both additions.
const REQUESTED_ACCESS_BY_VERSION = {
  1: { canReadAllObjectRecords: true, canUpdateCompanies: false },
  2: { canReadAllObjectRecords: true, canUpdateCompanies: true },
  3: { canReadAllObjectRecords: false, canUpdateCompanies: false },
} as const;

const requestedAccess = REQUESTED_ACCESS_BY_VERSION[REQUESTED_ACCESS_VERSION];

export default defineApplicationRole({
  universalIdentifier: REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Grant demo requested role',
  description: 'What the Grant demo app asks for',
  canReadAllObjectRecords: requestedAccess.canReadAllObjectRecords,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: requestedAccess.canUpdateCompanies,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
