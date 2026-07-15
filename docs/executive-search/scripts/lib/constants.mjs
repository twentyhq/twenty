// constants.mjs — single source of truth for canonical governance values.
// Imported by generator, validator, bootstrap, and tests to prevent drift.

export const SENTINEL = 'UNKNOWN_PENDING_SCHEMA_SNAPSHOT';

export const VALID_AUTHORITIES = [
  'DIRECTUS_AUTHORITATIVE',
  'TWENTY_AUTHORITATIVE',
  'APPEND_ONLY_BOTH_WITH_SHARED_IDEMPOTENCY',
  'DERIVED_IN_TWENTY_FROM_DIRECTUS',
  'DERIVED_IN_DIRECTUS_FROM_TWENTY',
  'REFERENCE_ONLY_NO_REPLICATION',
  'NOT_ALLOWED_TO_SYNC',
];

export const VALID_DISPOSITIONS = [
  'MAPPED',
  'REFERENCE_ONLY',
  'PORTAL_ONLY',
  'LEGACY',
  'OUT_OF_SCOPE',
];

export const VALID_OWNERS = ['CORE_STANDARD', 'APP_TECHNICAL'];

export const VALID_LIFECYCLE = [
  'PRESERVE',
  'DISABLE_RUNTIME',
  'REMOVE_APP_METADATA',
];

export const VALID_MIGRATION = [
  'CORE_UPGRADE_COMMAND',
  'APP_INSTALL_HOOK',
  'NOT_APPLICABLE',
];
