import { defineRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// records the assistant links conversations to and writes summaries on
const READ_AND_UPDATE_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget.universalIdentifier,
];

const READ_ONLY_OBJECT_UNIVERSAL_IDENTIFIERS = [
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  WHATSAPP_AD_REFERRAL_UNIVERSAL_IDENTIFIER,
];

export default defineRole({
  universalIdentifier: WHATSAPP_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'WhatsApp assistant',
  description:
    'Lets the WhatsApp assistant read people, companies and opportunities, link WhatsApp conversations to them, write summaries as notes and follow-ups as tasks, and read WhatsApp templates, campaigns and ad referrals. Messages are read and sent through the WhatsApp tools.',
  recordsPermissions: {
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    objects: [
      ...READ_AND_UPDATE_OBJECT_UNIVERSAL_IDENTIFIERS.map((objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      })),
      ...READ_ONLY_OBJECT_UNIVERSAL_IDENTIFIERS.map((objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      })),
    ],
  },
  canUpdateAllSettings: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: false,
  canAccessAllTools: false,
  permissionFlagUniversalIdentifiers: [],
});
