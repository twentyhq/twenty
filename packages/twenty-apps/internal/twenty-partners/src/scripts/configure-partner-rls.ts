// Does two things on each run:
//
// 1. UPSERTS the row-level-permission predicates on the Partner role: one per target
//    object (partner, person, company, opportunity) = "partnerUser IS the current
//    workspace member", PLUS one on workspaceMember = "id IS the current member" so the
//    role's read on workspaceMember is scoped to the partner's own record (member-typed
//    relations resolve for themselves; the internal team roster stays hidden). These are
//    configured out-of-band because the app manifest cannot ship RLS predicates. Re-run
//    after every install or reinstall. The mutation is fully idempotent (upsert semantics).
//
//    Field choice: the metadata API exposes the relation field `partnerUser`
//    (type RELATION) rather than a separate `partnerUserId` join-column field. The
//    upsertRowLevelPermissionPredicates mutation accepts the RELATION field id directly.
//    Operand: IS (value null + workspaceMemberFieldMetadataId injects the current member).
//    NOT CONTAINS — the query engine's RELATION filter only accepts IS / IS_NOT and throws
//    "Unknown operand CONTAINS for RELATION filter" at enforcement time, even though the
//    upsert mutation silently accepts CONTAINS.
//
// 2. VERIFIES the Opportunity field permissions declared in `partner.role.ts` and
//    deployed via `yarn twenty dev --once`. The script does NOT set these permissions:
//    upsertFieldPermissions enforces an application-ownership check that rejects
//    out-of-band changes to app-owned roles (ROLE_BELONGS_TO_ANOTHER_APPLICATION).
//    The manifest is the correct and only supported mechanism for app-owned roles.
//    If any expected field locks are missing, the script exits non-zero and instructs
//    the operator to run `yarn twenty dev --once` to deploy the manifest.
//
// Usage:
//   yarn rls:configure          # against .env.local
//   yarn rls:configure:prod     # against .env.prod

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

// The four object names we need to configure RLS on.
const TARGET_OBJECTS = ['partner', 'person', 'company', 'opportunity'] as const;
type TargetObject = (typeof TARGET_OBJECTS)[number];

// System / immutable Opportunity fields that must NOT be included in the
// field-permission lock list. `stage` is also excluded because it is the one
// field the Partner role should be allowed to update.
const OPPORTUNITY_FIELD_LOCK_SKIP = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'stage',
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
};

async function main() {
  const baseUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  const apiKey = requireEnv('TWENTY_PARTNERS_API_KEY');
  const metadataUrl = `${baseUrl}/metadata`;

  console.log(`[rls:configure] target: ${metadataUrl}`);

  // ── 1. Resolve all object metadata IDs and their partnerUser field IDs ──────

  // First get all objects in one request to map nameSingular → id.
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

  for (const name of TARGET_OBJECTS) {
    if (!objectIdByName.has(name)) {
      throw new Error(
        `Object "${name}" not found in workspace metadata. ` +
          `Has the app been installed and synced?`,
      );
    }
  }

  // Also need workspaceMember.
  if (!objectIdByName.has('workspaceMember')) {
    throw new Error('workspaceMember object not found in workspace metadata.');
  }

  const workspaceMemberId = objectIdByName.get('workspaceMember') as string;

  // Resolve partnerUser field id for each target object (with pagination).
  const objectInfoByName = new Map<TargetObject, ObjectInfo>();

  for (const name of TARGET_OBJECTS) {
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
  // universalIdentifier, so we match on the role label. This is the only available
  // discriminator: if the Partner role's label is renamed in partner.role.ts,
  // update the literal below to match.
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

  // Match by label "Partner" (the label we set in the manifest).
  // Note: universalIdentifier is PARTNER_ROLE_UNIVERSAL_IDENTIFIER but is not
  // returned by getRoles. Label is the safest available discriminator.
  const partnerRole = roles.find((r) => r.label === 'Partner');

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
  // Predicate semantics: "the record's partnerUser relation IS the current workspace
  // member" — i.e. the partnerUser FK equals the session user.
  // Operand IS (not CONTAINS): the query engine's RELATION filter only accepts IS / IS_NOT.
  // The upsert mutation accepts CONTAINS, but enforcement throws "Unknown operand CONTAINS
  // for RELATION filter" at query time. value stays null; workspaceMemberFieldMetadataId
  // injects the current member at query time. Mirrors the Roles-UI conversion for a
  // relation current-member RLS predicate (operand IS, value null, workspaceMemberFieldMetadataId).

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
        }
      }
    }
  `;

  const results: PredicateResult[] = [];

  for (const name of TARGET_OBJECTS) {
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
            // workspaceMemberFieldMetadataId scopes the predicate to the
            // current session's workspace member (the "id" field).
            workspaceMemberFieldMetadataId: workspaceMemberIdFieldId,
          },
        ],
        predicateGroups: [],
      },
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

  // workspaceMember predicate: scope the Partner role to its OWN member record only.
  // The role has read on workspaceMember so the partner UI can resolve member-typed
  // relations (their partnerUser link; owner/createdBy on their opportunities). Without
  // this scope, that read would expose the whole internal team roster. Semantics:
  // "this workspaceMember's id IS the current session member" → a partner sees only
  // themselves; other members (e.g. an opportunity's internal owner) resolve to null.
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
      },
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
      `(${TARGET_OBJECTS.length} objects + workspaceMember self-scope)`,
  );

  // ── 5. Verify Opportunity field permissions: read-all / update-stage-only ─────
  //
  // Opportunity field permissions for the Partner role are declared in
  // src/roles/partner.role.ts and deployed by `yarn twenty dev --once` (manifest
  // sync). They cannot be set here via upsertFieldPermissions because the server
  // enforces an application-ownership check: the mutation always runs in the
  // workspace Custom-app context, which does not match the Partner role's owning
  // application (the partners app). Attempting to set them would return
  // ROLE_BELONGS_TO_ANOTHER_APPLICATION. The manifest route is the correct
  // and only supported mechanism for app-owned roles.
  //
  // This step queries the Partner role's existing fieldPermissions and prints the
  // verification summary so a single run of `yarn rls:configure` confirms the
  // full permission state (predicates + field locks) after a sync.

  const oppInfo = objectInfoByName.get('opportunity') as ObjectInfo;
  const oppObjectId = oppInfo.objectMetadataId;

  const allOppFields = await collectAllFields(metadataUrl, apiKey, oppObjectId);
  const oppFieldIdToName = new Map<string, string>(
    allOppFields.map((f) => [f.id, f.name]),
  );

  // Build the expected lock set: every non-system, non-stage Opportunity field.
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

  const stageIsLocked = oppLockedFps.some(
    (fp) => oppFieldIdToName.get(fp.fieldMetadataId) === 'stage',
  );

  if (stageIsLocked) {
    console.warn(
      `[rls:configure] WARNING: stage field is locked — it should be editable. ` +
        `Remove it from fieldPermissions in partner.role.ts and re-sync.`,
    );
  }

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
    `[rls:configure] ✓ ${oppLockedFps.length} Opportunity fields locked (stage editable only) — field permissions verified`,
  );
}

main().catch((err: unknown) => {
  console.error('[rls:configure] FAILED:', err);
  process.exit(1);
});
