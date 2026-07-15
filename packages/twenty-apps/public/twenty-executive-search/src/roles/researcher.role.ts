import { defineRole } from 'twenty-sdk/define';

import { RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/role-universal-identifiers';

export default defineRole({
  universalIdentifier: RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Executive Search — Researcher',
  description:
    'Research-only role for executive search. Grants access to research fields and public profiles. ' +
    'Explicitly denied access to all commercial, demographic, medical, and legacy-AI fields. ' +
    'No permission flags granted.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
  // Once executiveProfile fields exist, fieldPermissions should deny read/update on all 20
  // prohibited selectors: subscription_tier, plan_level, is_premium, stripe_customer_id,
  // purchase_payment_history, marketing_opt_in, learning_activity, course_completion,
  // quiz_activity, content_consumption, profile_views, marketing_engagement,
  // candidate_service_usage_frequency, executive_psychographic, photo_analysis_scores,
  // birthdate, gender, voluntary_demographics, accommodation_medical_info,
  // unreviewed_culture_fit_score.
});
