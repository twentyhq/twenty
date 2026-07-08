import {
  defineApplicationRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const fullAccess = (objectUniversalIdentifier: string) => ({
  objectUniversalIdentifier,
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
});

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Salesforce migration role',
  description:
    'Reads and writes CRM records (companies, people, opportunities, tasks, notes) to import Salesforce data, and manages the migration tracking objects.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    fullAccess(STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier),
    fullAccess(STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier),
    fullAccess(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    ),
    fullAccess(STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier),
    fullAccess(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget.universalIdentifier,
    ),
    fullAccess(STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier),
    fullAccess(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget.universalIdentifier,
    ),
    fullAccess(MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER),
    fullAccess(MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER),
    fullAccess(MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER),
  ],
});
