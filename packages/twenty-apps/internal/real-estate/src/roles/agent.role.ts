import {
  defineRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export const AGENT_ROLE_UNIVERSAL_IDENTIFIER =
  '253f1693-39e2-423f-93ef-87811d0b2298';

const readWrite = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

export default defineRole({
  universalIdentifier: AGENT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Agent',
  description:
    'Works listings, showings and contacts. No access to opportunities.',
  icon: 'IconUserStar',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    { objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER, ...readWrite },
    { objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER, ...readWrite },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      ...readWrite,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
      ...readWrite,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
      ...readWrite,
    },
  ],
});
