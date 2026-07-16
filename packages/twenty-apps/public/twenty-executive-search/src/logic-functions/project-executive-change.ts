import { randomUUID } from 'crypto';

import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { PROJECT_EXECUTIVE_CHANGE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/project-executive-change-logic-function-universal-identifier';
import { getDirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';
import { signDirectusProjection } from 'src/logic-functions/directus-api/sign-directus-projection.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Fields to exclude from the projection payload (firewall-prohibited).
const FIREWALL_PROHIBITED_FIELDS = new Set([
  'subscription_tier',
  'plan_level',
  'is_premium',
  'stripe_customer_id',
  'purchase_payment_history',
  'marketing_opt_in',
  'birthdate',
  'gender',
  'voluntary_demographics',
  'accommodation_medical_info',
  'photo_analysis_scores',
  'executive_psychographic',
]);

const EXECUTIVE_OBJECT_NAMES = [
  'executiveProfile',
  'executiveCareerExperience',
  'executiveEducation',
  'executiveBoardService',
  'executiveCapability',
  'executiveLanguage',
  'executiveArtifact',
  'executiveAward',
  'executiveExternalProfile',
  'executiveSearchPreference',
];

type ExecutiveRecord = {
  id: string;
  [key: string]: unknown;
};

type ExecutiveDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<ExecutiveRecord>
>;

const buildSafeProjectionPayload = (
  record: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  if (isUndefined(record)) {
    return {};
  }

  const safe: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (!FIREWALL_PROHIBITED_FIELDS.has(key)) {
      safe[key] = value;
    }
  }

  return safe;
};

const computeContentHash = (data: Record<string, unknown>): string => {
  const json = JSON.stringify(data, Object.keys(data).sort());

  // Simple FNV-1a-like hash for content comparison (not cryptographic).
  let hash = 0x811c9dc5;

  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0
    .toString(16)
    .padStart(8, '0');
};

const isDirectusOrigin = (event: ExecutiveDatabaseEvent): boolean => {
  // Echo prevention: skip events that originated from a Directus sync source.
  const userId = event.userId;

  // If the change was made by a system user or Directus integration, skip.
  if (isNonEmptyString(userId) && userId.startsWith('directus-')) {
    return true;
  }

  // Simple metadata check; extended in PR4.
  return false;
};

export const projectExecutiveChangeHandler = async (
  event: ExecutiveDatabaseEvent,
): Promise<object> => {
  // Default-off: no-op when Directus sync is not configured.
  const configResult = getDirectusApiConfig();

  if (!configResult.success) {
    return { skipped: true, reason: configResult.reason };
  }

  const [objectName, action] = event.name.split('.');

  if (!EXECUTIVE_OBJECT_NAMES.includes(objectName)) {
    return { skipped: true, reason: `not an executive object: ${objectName}` };
  }

  // Echo prevention: skip events originating from DIRECTUS source.
  if (isDirectusOrigin(event)) {
    return { skipped: true, reason: 'event originated from Directus' };
  }

  const client = new CoreApiClient();

  const beforeRecord = event.properties.before as
    | Record<string, unknown>
    | undefined;
  const afterRecord = event.properties.after as
    | Record<string, unknown>
    | undefined;

  const safeBefore = buildSafeProjectionPayload(beforeRecord);
  const safeAfter = buildSafeProjectionPayload(afterRecord);
  const beforeHash = computeContentHash(safeBefore);
  const afterHash = computeContentHash(safeAfter);

  // No meaningful change after filtering.
  if (beforeHash === afterHash) {
    return {
      skipped: true,
      reason: 'no meaningful change after firewall filtering',
    };
  }

  const payload = {
    action,
    objectName,
    recordId: event.recordId,
    before: safeBefore,
    after: safeAfter,
  };

  const payloadJson = JSON.stringify(payload);

  // Sign the projection payload.
  const { timestamp, signature } = signDirectusProjection({
    body: payloadJson,
    secret: configResult.config.apiKey,
  });

  const eventId = randomUUID();
  const idempotencyKey = `${event.name}:${event.recordId}:${afterHash}`;

  const mutationResult = await client.mutation({
    createExternalSyncOutboundEvent: {
      __args: {
        data: {
          eventId,
          idempotencyKey,
          targetCollection: mapObjectNameToCollection(objectName),
          payload: JSON.stringify({
            ...payload,
            signature,
            signedAt: timestamp,
          }),
          beforeHash,
          afterHash,
          status: 'PENDING',
        },
      },
      id: true,
    },
  });

  return {
    outboundEventId: mutationResult.createExternalSyncOutboundEvent?.id,
    eventId,
    objectName,
    action,
    recordId: event.recordId,
    beforeHash,
    afterHash,
  };
};

// Maps Twenty object names to Directus collection names.
const mapObjectNameToCollection = (objectName: string): string => {
  const COLLECTION_MAP: Record<string, string> = {
    executiveProfile: 'executive_profiles',
    executiveCareerExperience: 'executive_career_experiences',
    executiveEducation: 'executive_educations',
    executiveBoardService: 'executive_board_services',
    executiveCapability: 'executive_capabilities',
    executiveLanguage: 'executive_languages',
    executiveArtifact: 'executive_artifacts',
    executiveAward: 'executive_awards',
    executiveExternalProfile: 'executive_external_profiles',
    executiveSearchPreference: 'executive_search_preferences',
  };

  return COLLECTION_MAP[objectName] ?? objectName;
};

export default defineLogicFunction({
  universalIdentifier:
    PROJECT_EXECUTIVE_CHANGE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'project-executive-change',
  description:
    'Projects executive profile changes to the outbound sync event ledger with HMAC-signed payloads for Directus delivery. Default-off when Directus is not configured.',
  timeoutSeconds: 60,
  handler: projectExecutiveChangeHandler,
  databaseEventTriggerSettings: {
    eventName: 'executiveProfile.*,executiveCareerExperience.*,executiveEducation.*,executiveBoardService.*,executiveCapability.*,executiveLanguage.*,executiveArtifact.*,executiveAward.*,executiveExternalProfile.*,executiveSearchPreference.*',
  },
});
