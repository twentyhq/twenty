/**
 * Schema definition for external sync event envelopes.
 * Adheres to docs/executive-search/contracts/external-sync-event.schema.json.
 */
export interface SyncEnvelope {
  eventId: string;
  idempotencyKey: string;
  eventVersion: string;
  sourceSystem: string;
  sourceCollection: string;
  sourceRecordId: string;
  workspaceKey: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

/** Known valid event versions. */
const KNOWN_EVENT_VERSIONS = ['1.0'];

/** Systems that can produce sync events. */
const SOURCE_SYSTEMS = ['DIRECTUS', 'TWENTY'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  reason?: string;
}

/**
 * Validate a sync envelope against the schema rules.
 * Processing rules: reject unknown eventVersion; echo prevention.
 */
export function validateSyncEnvelope(envelope: unknown): ValidationResult {
  const errors: string[] = [];

  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, errors: ['Envelope must be a non-null object'] };
  }

  const env = envelope as Record<string, unknown>;

  // Required string fields
  const requiredFields = [
    'eventId',
    'idempotencyKey',
    'eventVersion',
    'sourceSystem',
    'sourceCollection',
    'sourceRecordId',
    'workspaceKey',
    'timestamp',
  ];

  for (const field of requiredFields) {
    if (!env[field] || typeof env[field] !== 'string') {
      errors.push(`Missing or invalid required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate eventVersion
  if (!KNOWN_EVENT_VERSIONS.includes(env.eventVersion as string)) {
    return {
      valid: false,
      errors: [
        `Unknown eventVersion: ${env.eventVersion}. Known versions: ${KNOWN_EVENT_VERSIONS.join(', ')}`,
      ],
      reason: 'UNKNOWN_EVENT_VERSION',
    };
  }

  // Validate sourceSystem
  if (!SOURCE_SYSTEMS.includes(env.sourceSystem as string)) {
    return {
      valid: false,
      errors: [`Unknown sourceSystem: ${env.sourceSystem}`],
      reason: 'UNKNOWN_SOURCE_SYSTEM',
    };
  }

  // Validate payload exists
  if (env.payload === undefined || env.payload === null) {
    errors.push('Missing required field: payload');
  }

  // Validate timestamp is ISO 8601
  if (typeof env.timestamp === 'string') {
    const ts = new Date(env.timestamp);
    if (isNaN(ts.getTime())) {
      errors.push('Invalid timestamp: not ISO 8601');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Echo prevention: skip inbound events with sourceSystem === 'TWENTY'.
 * This prevents Twenty from processing its own outbound events as inbound.
 */
export function isEchoEvent(envelope: SyncEnvelope): boolean {
  return envelope.sourceSystem === 'TWENTY';
}
