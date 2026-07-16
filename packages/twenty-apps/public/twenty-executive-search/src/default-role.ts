import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineApplicationRole,
} from 'twenty-sdk/define';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';
import { SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import {
  ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Raw UUIDs from STANDARD_OBJECTS (twenty-shared) for executive objects
// that do not yet exist in the published twenty-sdk/define.
// These are the stable universal identifiers pinned in the standard-object
// constant and will never change.
const EXECUTIVE_PROFILE_UID = 'd5d279c4-be50-4a44-896e-e64d63f2a7f6';
const EXECUTIVE_CAREER_EXPERIENCE_UID =
  '190293c9-19bb-4bce-a532-90f82606cee0';
const EXECUTIVE_EDUCATION_UID = 'bf6030cd-7ce5-4c11-bf81-974ff65fd4b1';
const EXECUTIVE_BOARD_SERVICE_UID = '30b0287e-6681-42c1-94f9-01ed0e06055b';
const EXECUTIVE_CAPABILITY_UID = '6dd2cb7c-9c30-47ed-bfb6-c8ccb33baaea';
const EXECUTIVE_LANGUAGE_UID = '2c749e10-ae76-4d9e-bed1-46630b4bf65e';
const EXECUTIVE_ARTIFACT_UID = '46f80f0a-d4b6-4bb8-92bc-4e5e30dbf999';
const EXECUTIVE_AWARD_UID = 'cc229997-5392-47cb-b8c6-093092b10821';
const EXECUTIVE_EXTERNAL_PROFILE_UID =
  '969bf0cb-9eef-4eee-a708-5e6f43443b2a';
const EXECUTIVE_SEARCH_PREFERENCE_UID =
  '304cabb0-42d9-4d78-a302-5106d73ed6bc';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,

  label: `${APP_DISPLAY_NAME} default role`,
  description:
    'Least-privilege base role for the executive-search application. ' +
    'Grants read and update access to searchEngagementTerms, searchAssignment, ' +
    'assignmentTeamMember, and searchMilestone objects.',

  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,

  objectPermissions: [
    {
      objectUniversalIdentifier:
        SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
