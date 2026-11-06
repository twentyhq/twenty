import {
  defineApplicationRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: IDENTIFIERS.role,
  label: 'CompanyEnrich research and enrichment',
  description: 'Reads company/person identifiers and saves CompanyEnrich data.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: ['company', 'person'].map((kind) => ({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[kind as 'company' | 'person']
        .universalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  })),
  fieldPermissions: [],
});
