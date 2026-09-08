#!/usr/bin/env node
// Points a ROLE at the view each object should open on for that role.
//
// Twenty has no role dimension on views — a view is workspace-wide or personal
// and nothing more — so the mapping lives in core.keyValuePair, one
// workspace-scoped row per role (`ENSO_ROLE_DEFAULT_VIEWS:<roleId>`), and is
// served to the client by the ensoViewerScope query. A view carries its own
// columns, filters, sorts, grouping and type, so pointing a role at a view is
// what gives that role its own list layout.
//
// Resolution order in the client is: an explicit ?viewId in the URL, then
// wherever that person was last, then this role default, then the workspace
// INDEX view. So this is a starting point, not a cage.
//
// Usage:
//   TWENTY_API_URL=https://crm.enso.ro \
//   TWENTY_API_KEY=<workspace api key> \
//   node packages/twenty-server/scripts/provision-role-default-views.mjs \
//     --role="Sales Manager" --map=opportunity=My\ Opportunities,person=My\ Contacts
//
//   --list                  show the roles, objects and view names to choose from
//   --role="<role label>"   which role to configure (required unless --list)
//   --map=obj=View,obj=View object nameSingular = view NAME pairs
//   --clear                 remove this role's defaults entirely
//   --dry-run               print the plan without writing

const API_URL = (process.env.TWENTY_API_URL ?? 'https://crm.enso.ro').replace(
  /\/$/,
  '',
);
const API_KEY = process.env.TWENTY_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const LIST = process.argv.includes('--list');
const CLEAR = process.argv.includes('--clear');
const arg = (name) =>
  process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(
    name.length + 3,
  );
const ROLE_LABEL = arg('role');
const MAP_ARG = arg('map');

if (!API_KEY) {
  console.error('Missing TWENTY_API_KEY env var (workspace API key).');
  process.exit(1);
}

const request = async (query, variables) => {
  const response = await fetch(`${API_URL}/metadata`, {
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
  const [{ getRoles }, { getViews }, { objects }] = await Promise.all([
    request(`query { getRoles { id label } }`),
    request(`query { getViews { id name key objectMetadataId } }`),
    request(
      `query { objects(paging: { first: 500 }) { edges { node { id nameSingular isActive } } } }`,
    ),
  ]);

  const activeObjects = objects.edges
    .map((edge) => edge.node)
    .filter((object) => object.isActive);
  const objectByName = new Map(
    activeObjects.map((object) => [object.nameSingular, object]),
  );
  const objectNameById = new Map(
    activeObjects.map((object) => [object.id, object.nameSingular]),
  );

  if (LIST) {
    console.log('Roles:');
    for (const role of getRoles) {
      console.log(`  ${role.label}`);
    }
    console.log('\nViews per object (name — INDEX marked):');

    const byObject = new Map();

    for (const view of getViews) {
      const objectName = objectNameById.get(view.objectMetadataId);

      if (!objectName) continue;

      byObject.set(objectName, [...(byObject.get(objectName) ?? []), view]);
    }

    for (const objectName of [...byObject.keys()].sort()) {
      console.log(`  ${objectName}`);
      for (const view of byObject.get(objectName)) {
        console.log(
          `    - ${view.name}${view.key === 'INDEX' ? '  [INDEX]' : ''}`,
        );
      }
    }

    return;
  }

  if (!ROLE_LABEL) {
    console.error('Missing --role="<role label>" (or pass --list).');
    process.exit(1);
  }

  const role = getRoles.find((candidate) => candidate.label === ROLE_LABEL);

  if (!role) {
    console.error(
      `Role "${ROLE_LABEL}" not found. Roles: ${getRoles
        .map((candidate) => candidate.label)
        .join(', ')}`,
    );
    process.exit(1);
  }

  if (CLEAR) {
    console.log(`Clearing default views for role "${role.label}"`);

    if (!DRY_RUN) {
      await request(
        `mutation Clear($roleId: String!) {
          ensoSetRoleDefaultViews(roleId: $roleId, defaultViews: []) { objectMetadataId }
        }`,
        { roleId: role.id },
      );
      console.log('Done.');
    } else {
      console.log('--dry-run: nothing written.');
    }

    return;
  }

  if (!MAP_ARG) {
    console.error(
      'Missing --map=objectNameSingular=View Name,objectNameSingular=View Name',
    );
    process.exit(1);
  }

  const defaultViews = [];
  const problems = [];

  for (const pair of MAP_ARG.split(',')) {
    const [objectName, ...viewNameParts] = pair.split('=');
    const viewName = viewNameParts.join('=').trim();
    const object = objectByName.get(objectName.trim());

    if (!object) {
      problems.push(`unknown object "${objectName.trim()}"`);
      continue;
    }

    const view = getViews.find(
      (candidate) =>
        candidate.objectMetadataId === object.id && candidate.name === viewName,
    );

    if (!view) {
      problems.push(`no view named "${viewName}" on ${object.nameSingular}`);
      continue;
    }

    defaultViews.push({ objectMetadataId: object.id, viewId: view.id });
    console.log(`  ${object.nameSingular} -> "${view.name}"`);
  }

  if (problems.length > 0) {
    console.error(`\nRefusing to write, ${problems.length} problem(s):`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  console.log(
    `\nRole "${role.label}" (${role.id}): ${defaultViews.length} default view(s)`,
  );

  if (DRY_RUN) {
    console.log('--dry-run: nothing written.');

    return;
  }

  await request(
    `mutation Set($roleId: String!, $defaultViews: [EnsoDefaultViewInput!]!) {
      ensoSetRoleDefaultViews(roleId: $roleId, defaultViews: $defaultViews) {
        objectMetadataId
        viewId
      }
    }`,
    { roleId: role.id, defaultViews },
  );

  console.log('Done.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
