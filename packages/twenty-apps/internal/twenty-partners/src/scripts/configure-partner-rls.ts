// Upserts one row-level-permission predicate per object (partner, person, company,
// opportunity) on the Partner role: "partnerUser is the current workspace member".
//
// Usage:
//   yarn rls:configure          # against .env.local
//   yarn rls:configure:prod     # against .env.prod
//
// Run after every install or reinstall of the app so that the RLS predicates are
// re-attached to the role (the app manifest cannot ship them).
//
// Field choice: the metadata API exposes the relation field `partnerUser` (type RELATION)
// rather than a separate `partnerUserId` join-column field. The
// upsertRowLevelPermissionPredicates mutation accepts the RELATION field id directly.
// Operand: CONTAINS — confirmed working against this server version.

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

  // ── 3. Resolve Partner role id ───────────────────────────────────────────────

  // getRoles returns a flat array (not a connection) and does NOT expose
  // universalIdentifier, so we match on the role label. This is the only available
  // discriminator: if the Partner role's label is renamed in partner.role.ts,
  // update the literal below to match.
  const rolesData = await metadataFetch<{
    getRoles: { id: string; label: string }[];
  }>(metadataUrl, apiKey, `{ getRoles { id label } }`);

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
  // Predicate semantics: "the record's partnerUser relation CONTAINS the current
  // workspace member" — i.e. the partnerUser FK equals the session user.
  // Operand CONTAINS is the correct choice for relation/current-member matching
  // (confirmed against this server version by manual introspection).

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
            operand: 'CONTAINS',
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

  console.log(
    `\n[rls:configure] Done — ${results.length}/${TARGET_OBJECTS.length} predicates upserted on Partner role`,
  );
}

main().catch((err: unknown) => {
  console.error('[rls:configure] FAILED:', err);
  process.exit(1);
});
