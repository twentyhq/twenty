// Idempotent. Re-run after every install/reinstall — the app manifest can't ship RLS
// predicates. Does three things:
//
// 1. Upserts row-level-permission predicates on the Partner role:
//    - "partnerUser IS the current member" on partner/person/company
//    - "(partnerUser IS me) OR (lastActivityAt IS EMPTY)" on application. RLS is validated on
//      INSERT against the row exactly as submitted, but a partner's Apply workflow creates the
//      row with partnerUser=null (on-application-created stamps it AFTER insert, as the app).
//      A strict "partnerUser IS me" would reject every apply, so the OR adds an escape hatch:
//      a freshly-created row (lastActivityAt null, set by the same handler) passes insert and
//      is readable by its creator until the handler stamps it.
//      ponytail: trade-off — an unstamped row is briefly readable by ANY partner (sub-second
//      window; permanent only if the handler fails to stamp). Acceptable for an internal
//      partner marketplace; tighten by setting partnerUser at insert if a current-member
//      workflow variable ever lands.
//    - "(partnerUser IS me) OR (isListed = true)" on opportunity (marketplace briefs)
//    - "id IS the current member" on workspaceMember (self-scope; internal roster hidden)
//
// 2. Verifies (does NOT set) the Opportunity field permissions from `partner.role.ts`.
//    upsertFieldPermissions rejects out-of-band changes to app-owned roles
//    (ROLE_BELONGS_TO_ANOTHER_APPLICATION), so those must come from the manifest; if any
//    expected lock is missing, the script exits non-zero and tells you to re-sync.
//
// 3. Verifies Application field permissions the same way (pitch editable; rest locked).
//
// Usage:
//   yarn rls:configure          # against .env.local
//   yarn rls:configure:prod     # against .env.prod

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_ROLE_LABEL } from 'src/roles/partner.role';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

const SIMPLE_TARGET_OBJECTS = ['partner', 'person', 'company'] as const;
type SimpleTargetObject = (typeof SIMPLE_TARGET_OBJECTS)[number];

// application + opportunity use OR groups (handled separately), but still need existence checks.
const ALL_TARGET_OBJECTS = [
  ...SIMPLE_TARGET_OBJECTS,
  'application',
  'opportunity',
] as const;

// Stable ids for the OR predicate groups — re-runs upsert in place instead of creating
// duplicate groups.
const OPPORTUNITY_RLS_OR_GROUP_ID = 'b7e7f3a0-4c5d-4e8f-9a1b-2c3d4e5f6789';
const APPLICATION_RLS_OR_GROUP_ID = 'a9c1f3d2-5b6e-4a7c-8d9f-1e2b3c4d5e6f';

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

// Application fields that must be locked (pitch + opportunity are partner-editable).
const APPLICATION_FIELD_LOCK_EXPECTED = new Set([
  'name',
  'partner',
  'partnerUser',
  'state',
  'lastActivityAt',
  'introSentAt',
]);

// Application fields that must NOT be locked: system columns, pitch + opportunity
// (editable), and updatedBy/position (server-managed — locking them breaks every update).
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

type ObjectInfo = {
  objectMetadataId: string;
  partnerUserFieldMetadataId: string;
};

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

// Pages through an object's fields until it finds a field with the given name.
// Uses cursor-based pagination to avoid truncation on large objects (company/opportunity
// have >200 fields, so a single 200-cap request may miss partnerUser).
async function findFieldByName(
  metadataUrl: string,
  apiKey: string,
  objectId: string,
  objectName: string,
  fieldName: string,
): Promise<string> {
  let after: string | null = null;
  let page = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    page++;
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

    const match = data.object.fields.edges.find(
      (e) => e.node.name === fieldName,
    );

    if (match) {
      console.log(
        `  [rls:configure] ${objectName}.${fieldName} found on page ${page} ` +
          `(type=${match.node.type}, id=${match.node.id})`,
      );
      return match.node.id;
    }

    if (!data.object.fields.pageInfo.hasNextPage) {
      // Print available fields to help diagnose a schema mismatch.
      const names = data.object.fields.edges
        .map((e) => e.node.name)
        .join(', ');
      throw new Error(
        `Field "${fieldName}" not found on object "${objectName}" after ${page} page(s). ` +
          `Last-page fields: ${names}`,
      );
    }

    after = data.object.fields.pageInfo.endCursor;
  }
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

type PredicateResult = {
  id: string;
  fieldMetadataId: string;
  objectMetadataId: string;
  operand: string;
  workspaceMemberFieldMetadataId: string | null;
  roleId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  positionInRowLevelPermissionPredicateGroup: number | null;
};

type UpsertPredicatesInput = {
  roleId: string;
  objectMetadataId: string;
  predicates: {
    fieldMetadataId: string;
    operand: string;
    workspaceMemberFieldMetadataId?: string | null;
    value?: boolean | null;
    rowLevelPermissionPredicateGroupId?: string | null;
    positionInRowLevelPermissionPredicateGroup?: number | null;
  }[];
  predicateGroups: {
    id?: string;
    objectMetadataId: string;
    logicalOperator: string;
    parentRowLevelPermissionPredicateGroupId?: string | null;
  }[];
};

async function main() {
  const baseUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  const apiKey = requireEnv('TWENTY_PARTNERS_API_KEY');
  const metadataUrl = `${baseUrl}/metadata`;

  console.log(`[rls:configure] target: ${metadataUrl}`);

  // ── 1. Resolve all object metadata IDs and their partnerUser field IDs ──────

  const objectsData = await metadataFetch<{
    objects: { edges: { node: { id: string; nameSingular: string } }[] };
  }>(
    metadataUrl,
    apiKey,
    `{ objects(paging:{first:100}) { edges { node { id nameSingular } } } }`,
  );

  const objectIdByName = new Map<string, string>(
    objectsData.objects.edges.map((e) => [e.node.nameSingular, e.node.id]),
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

  const workspaceMemberId = objectIdByName.get('workspaceMember') as string;

  const objectInfoByName = new Map<SimpleTargetObject, ObjectInfo>();

  for (const name of SIMPLE_TARGET_OBJECTS) {
    const objectId = objectIdByName.get(name) as string;
    const partnerUserFieldMetadataId = await findFieldByName(
      metadataUrl,
      apiKey,
      objectId,
      name,
      'partnerUser',
    );
    objectInfoByName.set(name, {
      objectMetadataId: objectId,
      partnerUserFieldMetadataId,
    });
  }

  const opportunityObjectId = objectIdByName.get('opportunity') as string;
  const opportunityPartnerUserFieldId = await findFieldByName(
    metadataUrl,
    apiKey,
    opportunityObjectId,
    'opportunity',
    'partnerUser',
  );
  const opportunityIsListedFieldId = await findFieldByName(
    metadataUrl,
    apiKey,
    opportunityObjectId,
    'opportunity',
    'isListed',
  );

  const applicationObjectIdForPredicate = objectIdByName.get(
    'application',
  ) as string;
  const applicationPartnerUserFieldId = await findFieldByName(
    metadataUrl,
    apiKey,
    applicationObjectIdForPredicate,
    'application',
    'partnerUser',
  );
  const applicationLastActivityAtFieldId = await findFieldByName(
    metadataUrl,
    apiKey,
    applicationObjectIdForPredicate,
    'application',
    'lastActivityAt',
  );

  // ── 2. Resolve workspaceMember.id field metadata id ──────────────────────────

  const workspaceMemberIdFieldId = await findFieldByName(
    metadataUrl,
    apiKey,
    workspaceMemberId,
    'workspaceMember',
    'id',
  );

  // ── 3. Resolve Partner role id and fetch field permissions in one request ──────
  //
  // getRoles returns a flat array (not a connection) and does NOT expose
  // universalIdentifier, so we match on the role label via the shared PARTNER_ROLE_LABEL
  // constant (exported from partner.role.ts) — a rename there can't desync this script.
  // Fetching fieldPermissions here avoids a second getRoles call later in step 5.
  const rolesData = await metadataFetch<{
    getRoles: {
      id: string;
      label: string;
      fieldPermissions: FieldPermissionResult[];
    }[];
  }>(
    metadataUrl,
    apiKey,
    `{ getRoles { id label fieldPermissions { id fieldMetadataId objectMetadataId canUpdateFieldValue canReadFieldValue } } }`,
  );

  const roles = rolesData.getRoles;
  const partnerRole = roles.find((r) => r.label === PARTNER_ROLE_LABEL);

  if (!partnerRole) {
    const labels = roles.map((r) => r.label).join(', ');
    throw new Error(
      `Partner role not found. Available roles: ${labels}. ` +
        `Ensure the app is installed (universalIdentifier=${PARTNER_ROLE_UNIVERSAL_IDENTIFIER}).`,
    );
  }

  console.log(
    `[rls:configure] Partner role id: ${partnerRole.id} ` +
      `(universalIdentifier in manifest: ${PARTNER_ROLE_UNIVERSAL_IDENTIFIER})`,
  );

  // ── 4. Upsert one predicate per object ───────────────────────────────────────
  //
  // "the record's partnerUser relation IS the current workspace member". Operand must be IS,
  // not CONTAINS: the upsert accepts CONTAINS but the RELATION query filter only allows
  // IS / IS_NOT and throws "Unknown operand CONTAINS for RELATION filter" at query time.
  // value stays null; workspaceMemberFieldMetadataId injects the current member at query time.

  const MUTATION = `
    mutation UpsertRLSPredicates($input: UpsertRowLevelPermissionPredicatesInput!) {
      upsertRowLevelPermissionPredicates(input: $input) {
        predicates {
          id
          fieldMetadataId
          objectMetadataId
          operand
          workspaceMemberFieldMetadataId
          roleId
          rowLevelPermissionPredicateGroupId
          positionInRowLevelPermissionPredicateGroup
        }
      }
    }
  `;

  const results: PredicateResult[] = [];

  for (const name of SIMPLE_TARGET_OBJECTS) {
    const info = objectInfoByName.get(name) as ObjectInfo;

    const data = await metadataFetch<{
      upsertRowLevelPermissionPredicates: {
        predicates: PredicateResult[];
      };
    }>(metadataUrl, apiKey, MUTATION, {
      input: {
        roleId: partnerRole.id,
        objectMetadataId: info.objectMetadataId,
        predicates: [
          {
            fieldMetadataId: info.partnerUserFieldMetadataId,
            operand: 'IS',
            workspaceMemberFieldMetadataId: workspaceMemberIdFieldId,
          },
        ],
        predicateGroups: [],
      } satisfies UpsertPredicatesInput,
    });

    const predicate =
      data.upsertRowLevelPermissionPredicates.predicates[0];

    if (!predicate) {
      throw new Error(
        `upsertRowLevelPermissionPredicates returned no predicates for object "${name}"`,
      );
    }

    results.push(predicate);
    console.log(
      `[rls:configure] ✓ ${name}: predicate id=${predicate.id} ` +
        `(fieldMetadataId=${predicate.fieldMetadataId}, operand=${predicate.operand})`,
    );
  }

  // Opportunity: (partnerUser IS me) OR (isListed = true) — listed briefs visible to all partners.
  {
    const oppData = await metadataFetch<{
      upsertRowLevelPermissionPredicates: { predicates: PredicateResult[] };
    }>(metadataUrl, apiKey, MUTATION, {
      input: {
        roleId: partnerRole.id,
        objectMetadataId: opportunityObjectId,
        predicateGroups: [
          {
            id: OPPORTUNITY_RLS_OR_GROUP_ID,
            objectMetadataId: opportunityObjectId,
            logicalOperator: 'OR',
            parentRowLevelPermissionPredicateGroupId: null,
          },
        ],
        predicates: [
          {
            fieldMetadataId: opportunityPartnerUserFieldId,
            operand: 'IS',
            workspaceMemberFieldMetadataId: workspaceMemberIdFieldId,
            rowLevelPermissionPredicateGroupId: OPPORTUNITY_RLS_OR_GROUP_ID,
            positionInRowLevelPermissionPredicateGroup: 0,
          },
          {
            fieldMetadataId: opportunityIsListedFieldId,
            operand: 'IS',
            value: true,
            rowLevelPermissionPredicateGroupId: OPPORTUNITY_RLS_OR_GROUP_ID,
            positionInRowLevelPermissionPredicateGroup: 1,
          },
        ],
      } satisfies UpsertPredicatesInput,
    });

    const oppPredicates =
      oppData.upsertRowLevelPermissionPredicates.predicates;

    if (oppPredicates.length < 2) {
      throw new Error(
        'upsertRowLevelPermissionPredicates returned fewer than 2 predicates for opportunity OR group',
      );
    }

    for (const predicate of oppPredicates) {
      results.push(predicate);
    }

    console.log(
      `[rls:configure] ✓ opportunity: OR group id=${OPPORTUNITY_RLS_OR_GROUP_ID} ` +
        `(${oppPredicates.length} predicates: partnerUser IS me OR isListed = true)`,
    );
  }

  // Application: (partnerUser IS me) OR (lastActivityAt IS EMPTY). The IS-EMPTY branch lets a
  // partner CREATE their own application — RLS is validated on insert against the row as
  // submitted (partnerUser is null until on-application-created stamps it). A scalar IS_EMPTY
  // on lastActivityAt resolves to `{ is: 'NULL' }`, which is unambiguous on both the insert
  // check and the SQL read path (a relation IS_EMPTY is riskier there). See header for the leak.
  {
    const appData = await metadataFetch<{
      upsertRowLevelPermissionPredicates: { predicates: PredicateResult[] };
    }>(metadataUrl, apiKey, MUTATION, {
      input: {
        roleId: partnerRole.id,
        objectMetadataId: applicationObjectIdForPredicate,
        predicateGroups: [
          {
            id: APPLICATION_RLS_OR_GROUP_ID,
            objectMetadataId: applicationObjectIdForPredicate,
            logicalOperator: 'OR',
            parentRowLevelPermissionPredicateGroupId: null,
          },
        ],
        predicates: [
          {
            fieldMetadataId: applicationPartnerUserFieldId,
            operand: 'IS',
            workspaceMemberFieldMetadataId: workspaceMemberIdFieldId,
            rowLevelPermissionPredicateGroupId: APPLICATION_RLS_OR_GROUP_ID,
            positionInRowLevelPermissionPredicateGroup: 0,
          },
          {
            fieldMetadataId: applicationLastActivityAtFieldId,
            operand: 'IS_EMPTY',
            rowLevelPermissionPredicateGroupId: APPLICATION_RLS_OR_GROUP_ID,
            positionInRowLevelPermissionPredicateGroup: 1,
          },
        ],
      } satisfies UpsertPredicatesInput,
    });

    const appPredicates =
      appData.upsertRowLevelPermissionPredicates.predicates;

    if (appPredicates.length < 2) {
      throw new Error(
        'upsertRowLevelPermissionPredicates returned fewer than 2 predicates for application OR group',
      );
    }

    for (const predicate of appPredicates) {
      results.push(predicate);
    }

    console.log(
      `[rls:configure] ✓ application: OR group id=${APPLICATION_RLS_OR_GROUP_ID} ` +
        `(${appPredicates.length} predicates: partnerUser IS me OR lastActivityAt IS EMPTY)`,
    );
  }

  // workspaceMember predicate: "id IS the current member", scoping the role's read to the
  // partner's own record. Other members (e.g. an opportunity's internal owner) resolve to null.
  {
    const wmData = await metadataFetch<{
      upsertRowLevelPermissionPredicates: { predicates: PredicateResult[] };
    }>(metadataUrl, apiKey, MUTATION, {
      input: {
        roleId: partnerRole.id,
        objectMetadataId: workspaceMemberId,
        predicates: [
          {
            fieldMetadataId: workspaceMemberIdFieldId,
            operand: 'IS',
            workspaceMemberFieldMetadataId: workspaceMemberIdFieldId,
          },
        ],
        predicateGroups: [],
      } satisfies UpsertPredicatesInput,
    });

    const wmPredicate =
      wmData.upsertRowLevelPermissionPredicates.predicates[0];

    if (!wmPredicate) {
      throw new Error(
        'upsertRowLevelPermissionPredicates returned no predicate for workspaceMember',
      );
    }

    results.push(wmPredicate);
    console.log(
      `[rls:configure] ✓ workspaceMember: predicate id=${wmPredicate.id} ` +
        `(fieldMetadataId=${wmPredicate.fieldMetadataId}, operand=${wmPredicate.operand})`,
    );
  }

  console.log(
    `\n[rls:configure] Done — ${results.length} predicates upserted on Partner role ` +
      `(${SIMPLE_TARGET_OBJECTS.length} simple objects + application OR group + opportunity OR group + workspaceMember self-scope)`,
  );

  // ── 5. Verify Opportunity field permissions (set via manifest, not here — see header) ─

  const oppObjectId = opportunityObjectId;

  const allOppFields = await collectAllFields(metadataUrl, apiKey, oppObjectId);
  const oppFieldIdToName = new Map<string, string>(
    allOppFields.map((f) => [f.id, f.name]),
  );

  // Build the expected lock set: every non-system Opportunity field (incl. stage + amount).
  const expectedLockedNames = new Set<string>(
    allOppFields
      .filter((f) => !OPPORTUNITY_FIELD_LOCK_SKIP.has(f.name))
      .map((f) => f.name),
  );

  // Filter to Opportunity field permissions that lock update access.
  // partnerRole was fetched with fieldPermissions in step 3 — no second getRoles needed.
  const oppLockedFps = partnerRole.fieldPermissions.filter(
    (fp) =>
      fp.objectMetadataId === oppObjectId && fp.canUpdateFieldValue === false,
  );

  const missingLocks = [...expectedLockedNames].filter(
    (name) =>
      !oppLockedFps.some(
        (fp) => oppFieldIdToName.get(fp.fieldMetadataId) === name,
      ),
  );

  if (missingLocks.length > 0) {
    console.error(
      `\n[rls:configure] DRIFT DETECTED: ${missingLocks.length} Opportunity field(s) ` +
        `are NOT locked (canUpdateFieldValue: false) on the Partner role:\n` +
        `  ${missingLocks.join(', ')}\n\n` +
        `These permissions are declared in partner.role.ts and must be deployed via the\n` +
        `app manifest. Run the following to deploy them:\n\n` +
        `  yarn twenty dev --once -r <remote>\n\n` +
        `(e.g. \`yarn twenty dev --once\` for local, ` +
        `\`yarn twenty dev --once -r partner-twenty-com\` for prod)\n`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[rls:configure] ✓ ${oppLockedFps.length} Opportunity fields locked (stage + amount read-only) — field permissions verified`,
  );

  // ── 6. Verify Application field permissions (set via manifest, not here — see header) ─

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
      `[rls:configure] WARNING: pitch field is locked — it should be editable. ` +
        `Remove it from fieldPermissions in partner.role.ts and re-sync.`,
    );
  }

  if (missingAppLocks.length > 0) {
    console.error(
      `\n[rls:configure] DRIFT DETECTED: ${missingAppLocks.length} Application field(s) ` +
        `are NOT locked (canUpdateFieldValue: false) on the Partner role:\n` +
        `  ${missingAppLocks.join(', ')}\n\n` +
        `These permissions are declared in partner.role.ts and must be deployed via the\n` +
        `app manifest. Run the following to deploy them:\n\n` +
        `  yarn twenty dev --once -r <remote>\n\n` +
        `(e.g. \`yarn twenty dev --once\` for local, ` +
        `\`yarn twenty dev --once -r partner-twenty-com\` for prod)\n`,
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
    `[rls:configure] ✓ ${appLockedFps.length} Application fields locked (pitch editable) — field permissions verified`,
  );
}

main().catch((err: unknown) => {
  console.error('[rls:configure] FAILED:', err);
  process.exit(1);
});
