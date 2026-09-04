// Read-only drift check. `partner.role.ts` declares every row-level predicate and the
// server ingests them from the manifest, so an install or upgrade configures them. This
// script no longer creates, updates or deletes any predicate.
//
// Legacy predicates on an already-installed workspace: earlier versions created them
// through upsertRowLevelPermissionPredicates, which stamps them with the workspace's
// custom application rather than twenty-partners. The manifest sync diffs by application,
// so it cannot see those rows and will never remove them.
//
// Ungrouped leftovers AND to the same ownership check and are redundant. Two parentless
// Opportunity OR groups are not. The RLS compiler keeps only the first parentless group,
// so leftover (partnerUser IS me) OR (isListed) can drop applicantPartnerUserIds CONTAINS.
// This script fails when it finds more than one. Remove leftover groups with database
// access while the manifest predicates stay in place. Do NOT clear them through the
// upsert mutation: it deletes every predicate for a (role, object) pair, and a Partner
// role with no predicate has no row filter at all, so partners would read the whole
// workspace until the manifest predicates were restored.
//
// Also verifies Opportunity and Application field permissions from `partner.role.ts`.
// upsertFieldPermissions rejects out-of-band changes to app-owned roles
// (ROLE_BELONGS_TO_ANOTHER_APPLICATION), so those must come from the manifest; if any
// expected lock is missing, the script exits non-zero and tells you to re-sync.
//
// Usage:
//   yarn rls:configure          # against .env.local
//   yarn rls:configure:prod     # against .env.prod

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_ROLE_LABEL } from 'src/roles/partner.role';
import { findParentlessOpportunityRlsGroups } from 'src/scripts/find-parentless-opportunity-rls-groups.util';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

const SIMPLE_TARGET_OBJECTS = [
  'partner',
  'person',
  'company',
  'partnerLink',
  'partnerService',
  'partnerContent',
  'application',
] as const;
// Opportunity is in this list so leftover parentless OR groups can be resolved by id.
const ALL_TARGET_OBJECTS = [...SIMPLE_TARGET_OBJECTS, 'opportunity'] as const;

// Opportunity fields that must NOT be locked: system columns and updatedBy/position
// (server-managed — locking them breaks every update; see src/roles/partner.role.ts).
// Stage + amount are expected locked (admin-only for partners). Everything else too.
const OPPORTUNITY_FIELD_LOCK_SKIP = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'updatedBy',
  'position',
]);

// Application fields that must be locked. pitch + opportunity are exempt from this set —
// not because a partner can edit them (they can't; the whole object is write-blocked) but
// because the apply route sets both once, at creation, under the application role.
const APPLICATION_FIELD_LOCK_EXPECTED = new Set([
  'name',
  'partner',
  'partnerUser',
  'state',
]);

// Application fields that must NOT be locked: system columns, pitch + opportunity
// (set once by the apply route, not by the partner), and updatedBy/position
// (server-managed — locking them breaks every update).
const APPLICATION_FIELD_LOCK_SKIP = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'updatedBy',
  'position',
  'searchVector',
  'pitch',
  'opportunity',
]);

type FieldEdge = {
  node: {
    id: string;
    name: string;
    type: string;
  };
};

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type FieldsPage = {
  edges: FieldEdge[];
  pageInfo: PageInfo;
};

type MetadataResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

async function metadataFetch<T>(
  metadataUrl: string,
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(metadataUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as MetadataResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`,
    );
  }

  return json.data;
}


// Collects every field on an object across all cursor pages.
// Required for Opportunity which can grow; always paginate fully.
async function collectAllFields(
  metadataUrl: string,
  apiKey: string,
  objectId: string,
): Promise<{ id: string; name: string; type: string }[]> {
  const all: { id: string; name: string; type: string }[] = [];
  let after: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pagingArg = after
      ? `paging:{first:200, after:"${after}"}`
      : `paging:{first:200}`;

    const query = `{
      object(id: "${objectId}") {
        fields(${pagingArg}) {
          edges { node { id name type } }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`;

    const data = await metadataFetch<{
      object: { fields: FieldsPage };
    }>(metadataUrl, apiKey, query);

    for (const edge of data.object.fields.edges) {
      all.push(edge.node);
    }

    if (!data.object.fields.pageInfo.hasNextPage) break;
    after = data.object.fields.pageInfo.endCursor;
  }

  return all;
}

type FieldPermissionResult = {
  id: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  canReadFieldValue: boolean | null;
  canUpdateFieldValue: boolean | null;
};

type PredicateGroupResult = {
  id: string;
  objectMetadataId: string;
  parentRowLevelPermissionPredicateGroupId?: string | null;
};

async function main() {
  const baseUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  const apiKey = requireEnv('TWENTY_PARTNERS_API_KEY');
  const metadataUrl = `${baseUrl}/metadata`;

  console.log(`[rls:configure] target: ${metadataUrl}`);

  // ── 1. Resolve the object metadata IDs ──────────────────────────────────────

  const objectsData = await metadataFetch<{
    objects: { edges: { node: { id: string; nameSingular: string } }[] };
  }>(
    metadataUrl,
    apiKey,
    `{ objects(paging:{first:100}) { edges { node { id nameSingular } } } }`,
  );

  const objectIdByName = new Map<string, string>(
    objectsData.objects.edges.map((edge) => [
      edge.node.nameSingular,
      edge.node.id,
    ]),
  );

  for (const name of ALL_TARGET_OBJECTS) {
    if (!objectIdByName.has(name)) {
      throw new Error(
        `Object "${name}" not found in workspace metadata. ` +
          `Has the app been installed and synced?`,
      );
    }
  }

  if (!objectIdByName.has('workspaceMember')) {
    throw new Error('workspaceMember object not found in workspace metadata.');
  }

  const opportunityObjectId = objectIdByName.get('opportunity') as string;

  // ── 2. Resolve Partner role, field permissions, and predicate groups ────────
  //
  // getRoles returns a flat array (not a connection) and does NOT expose
  // universalIdentifier, so we match on the role label via the shared PARTNER_ROLE_LABEL
  // constant (exported from partner.role.ts) — a rename there can't desync this script.
  const rolesData = await metadataFetch<{
    getRoles: {
      id: string;
      label: string;
      fieldPermissions: FieldPermissionResult[];
      rowLevelPermissionPredicateGroups: PredicateGroupResult[];
    }[];
  }>(
    metadataUrl,
    apiKey,
    `{ getRoles { id label fieldPermissions { id fieldMetadataId objectMetadataId canUpdateFieldValue canReadFieldValue } rowLevelPermissionPredicateGroups { id objectMetadataId parentRowLevelPermissionPredicateGroupId } } }`,
  );

  const roles = rolesData.getRoles;
  const partnerRole = roles.find((role) => role.label === PARTNER_ROLE_LABEL);

  if (!partnerRole) {
    const labels = roles.map((role) => role.label).join(', ');
    throw new Error(
      `Partner role not found. Available roles: ${labels}. ` +
        `Ensure the app is installed (universalIdentifier=${PARTNER_ROLE_UNIVERSAL_IDENTIFIER}).`,
    );
  }

  console.log(
    `[rls:configure] Partner role id: ${partnerRole.id} ` +
      `(universalIdentifier in manifest: ${PARTNER_ROLE_UNIVERSAL_IDENTIFIER})`,
  );

  const parentlessOpportunityGroups = findParentlessOpportunityRlsGroups(
    partnerRole.rowLevelPermissionPredicateGroups ?? [],
    opportunityObjectId,
  );

  if (parentlessOpportunityGroups.length > 1) {
    const leftoverGroupIds = parentlessOpportunityGroups
      .map((group) => group.id)
      .join(', ');

    console.error(
      `\n[rls:configure] DRIFT DETECTED: Partner role has ` +
        `${parentlessOpportunityGroups.length} parentless Opportunity RLS groups ` +
        `(${leftoverGroupIds}).\n` +
        `The filter compiler keeps only the first parentless group, so leftover\n` +
        `(partnerUser IS me) OR (isListed) can drop applicantPartnerUserIds CONTAINS.\n\n` +
        `Keep the twenty-partners manifest group. Soft-delete the leftover custom-\n` +
        `application group (and its predicates) in core.rowLevelPermissionPredicateGroup\n` +
        `/ core.rowLevelPermissionPredicate. Inspect applicationId first:\n\n` +
        `  SELECT id, "universalIdentifier", "applicationId"\n` +
        `  FROM core."rowLevelPermissionPredicateGroup"\n` +
        `  WHERE id IN (${parentlessOpportunityGroups.map((group) => `'${group.id}'`).join(', ')});\n\n` +
        `Do NOT call upsertRowLevelPermissionPredicates for (Partner, opportunity):\n` +
        `it wipes every predicate for that pair and leaves partners unfiltered.\n`,
    );
    process.exitCode = 1;
    return;
  }

  // ── 3. Verify Opportunity field permissions (set via manifest, not here — see header) ─

  const oppObjectId = opportunityObjectId;

  const allOppFields = await collectAllFields(metadataUrl, apiKey, oppObjectId);
  const oppFieldIdToName = new Map<string, string>(
    allOppFields.map((field) => [field.id, field.name]),
  );

  const applicantPartnerUserIdsField = allOppFields.find(
    (field) => field.name === 'applicantPartnerUserIds',
  );
  const applicantPartnerUserIdsPermission =
    applicantPartnerUserIdsField &&
    partnerRole.fieldPermissions.find(
      (fieldPermission) =>
        fieldPermission.fieldMetadataId === applicantPartnerUserIdsField.id,
    );

  if (
    !applicantPartnerUserIdsField ||
    applicantPartnerUserIdsPermission?.canReadFieldValue !== false
  ) {
    console.error(
      `\n[rls:configure] DRIFT DETECTED: applicantPartnerUserIds must be ` +
        `read-locked on the Partner role (canReadFieldValue: false).\n` +
        `Without that lock one applicant can read the other applicants' member ids.\n` +
        `Deploy partner.role.ts via yarn twenty apply -r <remote>.\n`,
    );
    process.exitCode = 1;
    return;
  }

  // Build the expected lock set: every non-system Opportunity field (incl. stage + amount).
  const expectedLockedNames = new Set<string>(
    allOppFields
      .filter((field) => !OPPORTUNITY_FIELD_LOCK_SKIP.has(field.name))
      .map((field) => field.name),
  );

  const oppLockedFps = partnerRole.fieldPermissions.filter(
    (fieldPermission) =>
      fieldPermission.objectMetadataId === oppObjectId &&
      fieldPermission.canUpdateFieldValue === false,
  );

  const missingLocks = [...expectedLockedNames].filter(
    (name) =>
      !oppLockedFps.some(
        (fieldPermission) =>
          oppFieldIdToName.get(fieldPermission.fieldMetadataId) === name,
      ),
  );

  if (missingLocks.length > 0) {
    console.error(
      `\n[rls:configure] DRIFT DETECTED: ${missingLocks.length} Opportunity field(s) ` +
        `are NOT locked (canUpdateFieldValue: false) on the Partner role:\n` +
        `  ${missingLocks.join(', ')}\n\n` +
        `These permissions are declared in partner.role.ts and must be deployed via the\n` +
        `app manifest. Run the following to deploy them:\n\n` +
        `  yarn twenty apply -r <remote>\n\n` +
        `(e.g. \`yarn twenty apply\` for local, ` +
        `\`yarn twenty apply -r partner-twenty-com\` for prod)\n`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[rls:configure] ✓ ${oppLockedFps.length} Opportunity fields locked (Partner role cannot write Opportunity at all; locks kept as intent) — field permissions verified`,
  );

  // ── 4. Verify Application field permissions (set via manifest, not here — see header) ─

  const applicationObjectId = objectIdByName.get('application') as string;

  const allAppFields = await collectAllFields(
    metadataUrl,
    apiKey,
    applicationObjectId,
  );
  const appFieldIdToName = new Map<string, string>(
    allAppFields.map((field) => [field.id, field.name]),
  );

  const appLockedFps = partnerRole.fieldPermissions.filter(
    (fieldPermission) =>
      fieldPermission.objectMetadataId === applicationObjectId &&
      fieldPermission.canUpdateFieldValue === false,
  );

  const missingAppLocks = [...APPLICATION_FIELD_LOCK_EXPECTED].filter(
    (name) =>
      !appLockedFps.some(
        (fieldPermission) =>
          appFieldIdToName.get(fieldPermission.fieldMetadataId) === name,
      ),
  );

  const unexpectedAppLocks = appLockedFps
    .map((fieldPermission) =>
      appFieldIdToName.get(fieldPermission.fieldMetadataId),
    )
    .filter(
      (name): name is string =>
        name !== undefined &&
        !APPLICATION_FIELD_LOCK_EXPECTED.has(name) &&
        !APPLICATION_FIELD_LOCK_SKIP.has(name),
    );

  const pitchIsLocked = appLockedFps.some(
    (fieldPermission) =>
      appFieldIdToName.get(fieldPermission.fieldMetadataId) === 'pitch',
  );

  if (pitchIsLocked) {
    console.warn(
      `[rls:configure] NOTE: pitch field is locked on the Partner role, beyond the ` +
        `expected set. Harmless — canUpdateObjectRecords already blocks every Partner ` +
        `write to Application, so this lock has no additional effect.`,
    );
  }

  if (missingAppLocks.length > 0) {
    console.error(
      `\n[rls:configure] DRIFT DETECTED: ${missingAppLocks.length} Application field(s) ` +
        `are NOT locked (canUpdateFieldValue: false) on the Partner role:\n` +
        `  ${missingAppLocks.join(', ')}\n\n` +
        `These permissions are declared in partner.role.ts and must be deployed via the\n` +
        `app manifest. Run the following to deploy them:\n\n` +
        `  yarn twenty apply -r <remote>\n\n` +
        `(e.g. \`yarn twenty apply\` for local, ` +
        `\`yarn twenty apply -r partner-twenty-com\` for prod)\n`,
    );
    process.exitCode = 1;
    return;
  }

  if (unexpectedAppLocks.length > 0) {
    console.warn(
      `[rls:configure] NOTE: ${unexpectedAppLocks.length} extra Application field(s) ` +
        `are locked beyond the expected set (platform fields may be locked intentionally):\n` +
        `  ${unexpectedAppLocks.join(', ')}`,
    );
  }

  console.log(
    `[rls:configure] ✓ ${appLockedFps.length} Application fields locked (Partner role cannot write Application at all; locks kept as intent) — field permissions verified`,
  );
}

main().catch((err: unknown) => {
  console.error('[rls:configure] FAILED:', err);
  process.exit(1);
});
