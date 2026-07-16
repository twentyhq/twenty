/**
 * Field-ownership guard.
 * Encodes the rules from docs/executive-search/directus-field-ownership.csv:
 *
 * - DIRECTUS_AUTHORITATIVE: write these fields from the inbound envelope
 * - NOT_ALLOWED_TO_SYNC: drop these fields (never written)
 * - NO_SYNC_SELECTION: drop these fields (unspecified)
 * - TWENTY_AUTHORITATIVE: drop these fields (Twenty owns them)
 *
 * PR2: stub implementation. PR3+ reads the actual CSV.
 */

export type FieldAuthority =
  | 'DIRECTUS_AUTHORITATIVE'
  | 'NOT_ALLOWED_TO_SYNC'
  | 'NO_SYNC_SELECTION'
  | 'TWENTY_AUTHORITATIVE';

// Per-collection field authority rules
// Replaced by CSV parsing in PR3+
const COLLECTION_FIELD_AUTHORITY: Record<string, Record<string, FieldAuthority>> = {};

/**
 * Filter envelope fields according to the field ownership rules.
 *
 * Returns only the fields whose authority is DIRECTUS_AUTHORITATIVE.
 * All other fields are dropped.
 */
export function filterAuthoritativeFields(
  collection: string,
  envelopeFields: Record<string, unknown>,
): Record<string, unknown> {
  const collectionRules = COLLECTION_FIELD_AUTHORITY[collection];

  // No rules for this collection → allow all fields (PR2 stub behavior)
  if (!collectionRules) {
    return { ...envelopeFields };
  }

  const result: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(envelopeFields)) {
    const authority = collectionRules[field];

    // Unknown field → allow (PR2 lenient behavior)
    if (!authority) {
      result[field] = value;
      continue;
    }

    // Only write DIRECTUS_AUTHORITATIVE fields
    if (authority === 'DIRECTUS_AUTHORITATIVE') {
      result[field] = value;
    }
    // NOT_ALLOWED_TO_SYNC, NO_SYNC_SELECTION, TWENTY_AUTHORITATIVE → drop
  }

  return result;
}

/**
 * Check whether a field is allowed to be written from Directus.
 */
export function isFieldAuthoritative(
  collection: string,
  fieldName: string,
): boolean {
  const collectionRules = COLLECTION_FIELD_AUTHORITY[collection];

  // No rules → allow (PR2 stub)
  if (!collectionRules) {
    return true;
  }

  const authority = collectionRules[fieldName];

  // Unknown field → allow
  if (!authority) {
    return true;
  }

  return authority === 'DIRECTUS_AUTHORITATIVE';
}
