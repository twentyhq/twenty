#!/usr/bin/env node
// Idempotent provisioning of the Sales Manager role's OBJECT-level permissions.
//
// Record-level scoping (only your own contacts and deals) is enforced
// separately by src/modules/enso/record-visibility, driven by the
// ENSO_SCOPED_VISIBILITY_ROLE_IDS env var. This script decides which objects a
// sales manager can reach at all, which is the other half of the answer.
//
// Talks to the running server's METADATA GraphQL API (/metadata) with a
// workspace API key — no DB access, safe against any environment, re-runnable.
//
// Usage:
//   TWENTY_API_URL=https://crm.enso.ro \
//   TWENTY_API_KEY=<workspace api key from Settings → APIs & Webhooks> \
//   node packages/twenty-server/scripts/provision-sales-manager-role.mjs
//
//   Add --dry-run to print the plan without writing.
//   Add --role="Some Role" to target a role other than "Sales Manager".

const API_URL = (process.env.TWENTY_API_URL ?? 'https://crm.enso.ro').replace(
  /\/$/,
  '',
);
const API_KEY = process.env.TWENTY_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const METADATA_ENDPOINT = `${API_URL}/metadata`;
const ROLE_LABEL =
  process.argv.find((arg) => arg.startsWith('--role='))?.slice('--role='.length) ??
  'Sales Manager';

if (!API_KEY) {
  console.error('Missing TWENTY_API_KEY env var (workspace API key).');
  process.exit(1);
}

// Their own records, deletable. Record scoping means "their own" is enforced
// per row, so soft-delete here can only ever reach what they already see.
// Destroy stays off everywhere: permanent deletion is an admin act.
const FULL = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: false,
};

// Editable but not deletable. The project x contact assignment IS the ownership
// record, and it has endedAt/endReason for ending one properly — deleting it
// would silently drop the manager's own access instead.
const EDITABLE_NOT_DELETABLE = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};
const READ_ONLY = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};
const HIDDEN = {
  canReadObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

// Read + write + soft-delete, record-scoped to what the manager owns.
const WORKED_OBJECTS = [
  'person',
  'opportunity',
  'task',
  'note',
  'outboundActivity',
  'personRelationship',
  // Consent governs whether they may contact their own client, so they have to
  // be able to change it. The consent EVENT trail stays read-only below: it is
  // an audit record and is written server-side.
  'personProjectConsent',
];

// Ownership records: editable, never deletable. See EDITABLE_NOT_DELETABLE.
const OWNERSHIP_OBJECTS = ['personProjectAssignment', 'companyProjectAssignment'];

// System objects (attachment, noteTarget, taskTarget, blocklist) reject object
// permissions by design and inherit access from what they hang off. They are
// still record-scoped by src/modules/enso/record-visibility.

// Read-only, still record-scoped: the system writes these, the manager reads
// their own.
const OBSERVED_OBJECTS = [
  'inboundActivity',
  'dealStateHistory',
  'personProjectConsentEvent',
  'sequenceRun',
  'marketingEnrollment',
];

// Reference data every manager needs in full, with no record scoping: a deal is
// unreadable without its project, and a company here is a building, not a book
// of business.
const REFERENCE_OBJECTS = ['project', 'company'];

// Operations and marketing surfaces. Nothing here is part of selling, and most
// of it exposes the whole pipeline sideways.
const HIDDEN_OBJECTS = [
  'workflow',
  'dashboard',
  'pbxNumber',
  'projectRoutingMember',
  'sequence',
];

const PLAN = [
  ...WORKED_OBJECTS.map((name) => [name, FULL]),
  ...OWNERSHIP_OBJECTS.map((name) => [name, EDITABLE_NOT_DELETABLE]),
  ...OBSERVED_OBJECTS.map((name) => [name, READ_ONLY]),
  ...REFERENCE_OBJECTS.map((name) => [name, READ_ONLY]),
  ...HIDDEN_OBJECTS.map((name) => [name, HIDDEN]),
];

const request = async (query, variables) => {
  const response = await fetch(METADATA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();

  if (body.errors) {
    throw new Error(JSON.stringify(body.errors, null, 2));
  }

  return body.data;
};

const main = async () => {
  const { getRoles } = await request(`query { getRoles { id label } }`);
  const role = getRoles.find((candidate) => candidate.label === ROLE_LABEL);

  if (!role) {
    console.error(
      `Role "${ROLE_LABEL}" not found. Existing roles: ${getRoles
        .map((candidate) => candidate.label)
        .join(', ')}`,
    );
    process.exit(1);
  }

  const { objects } = await request(
    `query { objects(paging: { first: 500 }) { edges { node { id nameSingular isActive isSystem } } } }`,
  );
  const objectIdByName = new Map(
    objects.edges
      .map((edge) => edge.node)
      .filter((node) => node.isActive && !node.isSystem)
      .map((node) => [node.nameSingular, node.id]),
  );

  const objectPermissions = [];
  const missing = [];

  for (const [nameSingular, permission] of PLAN) {
    const objectMetadataId = objectIdByName.get(nameSingular);

    if (!objectMetadataId) {
      missing.push(nameSingular);
      continue;
    }

    objectPermissions.push({ objectMetadataId, ...permission });
  }

  if (missing.length > 0) {
    console.warn(
      `Skipping objects that are absent or system-owned here: ${missing.join(', ')}`,
    );
  }

  console.log(`Role "${role.label}" (${role.id})`);
  console.log(
    `  ${WORKED_OBJECTS.length} worked (+soft-delete), ${OWNERSHIP_OBJECTS.length} ownership (no delete), ${OBSERVED_OBJECTS.length} read-only scoped,`,
  );
  console.log(`  ${REFERENCE_OBJECTS.length} reference, ${HIDDEN_OBJECTS.length} hidden`);
  console.log(
    '  role defaults -> read/update/delete all object records: false (grants become explicit)',
  );

  if (DRY_RUN) {
    console.log('\n--dry-run: nothing written.');

    return;
  }

  // Defaults go to deny FIRST, so an object this script does not name is
  // invisible rather than briefly world-readable.
  await request(
    `mutation UpdateRole($input: UpdateRoleInput!) {
      updateOneRole(updateRoleInput: $input) { id label canReadAllObjectRecords }
    }`,
    {
      input: {
        id: role.id,
        update: {
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          // The record-visibility engine resolves the viewer from a user auth
          // context, so an API key holding this role would not be scoped.
          // Keep it off users' keys and agents.
          canBeAssignedToApiKeys: false,
          canBeAssignedToAgents: false,
        },
      },
    },
  );

  await request(
    `mutation UpsertObjectPermissions($input: UpsertObjectPermissionsInput!) {
      upsertObjectPermissions(upsertObjectPermissionsInput: $input) {
        objectMetadataId
        canReadObjectRecords
        canUpdateObjectRecords
      }
    }`,
    { input: { roleId: role.id, objectPermissions } },
  );

  console.log(`\nDone. ${objectPermissions.length} object permissions written.`);
  console.log(
    'Record scoping stays off until ENSO_SCOPED_VISIBILITY_ROLE_IDS includes',
  );
  console.log(`  ${role.id}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
