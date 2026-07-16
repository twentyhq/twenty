import { defineApplicationRole } from 'twenty-sdk/define';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-profile.object';
import { EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-career-experience.object';
import { EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-education.object';
import { EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-board-service.object';
import { EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-capability.object';
import { EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-language.object';
import { EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-artifact.object';
import { EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-award.object';
import { EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-external-profile.object';
import { EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-search-preference.object';
import { EXECUTIVE_SEARCH_PREFERENCE_COMPENSATION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/executive-search-preference.object';

function readOnlyPermission(objectUniversalIdentifier: string) {
  return {
    objectUniversalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  };
}

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,

  label: `${APP_DISPLAY_NAME} default role`,
  description:
    'Least-privilege base role for the executive-search application. ' +
    'Grants read-only access to executive profile domain objects. ' +
    'Compensation expectation is restricted and unreadable to the base role.',

  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,

  objectPermissions: [
    readOnlyPermission(EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER),
    readOnlyPermission(EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER),
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_COMPENSATION_FIELD_UNIVERSAL_IDENTIFIER,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlagUniversalIdentifiers: [],
});
