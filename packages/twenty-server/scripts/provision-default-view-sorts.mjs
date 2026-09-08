#!/usr/bin/env node
// Sorts every DEFAULT view newest-first on creation date.
//
// Twenty ships default (key = INDEX) views with no sort at all, so they fall
// back to `position` — which for imported and intake-created records is
// effectively arbitrary, and puts the oldest rows on top. This gives every
// default view an explicit `createdAt DESC`.
//
// Talks to the running server's METADATA GraphQL API (/metadata) with a
// workspace API key — no DB access, safe against any environment, and
// re-runnable: a view that already sorts on createdAt is left alone, and one
// sorting ascending is corrected rather than duplicated.
//
// Usage:
//   TWENTY_API_URL=https://crm.enso.ro \
//   TWENTY_API_KEY=<workspace api key from Settings → APIs & Webhooks> \
//   node packages/twenty-server/scripts/provision-default-view-sorts.mjs
//
//   Add --dry-run to print the plan without writing.

const API_URL = (process.env.TWENTY_API_URL ?? 'https://crm.enso.ro').replace(
  /\/$/,
  '',
);
const API_KEY = process.env.TWENTY_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const METADATA_ENDPOINT = `${API_URL}/metadata`;

if (!API_KEY) {
  console.error('Missing TWENTY_API_KEY env var (workspace API key).');
  process.exit(1);
}

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
  const { getViews } = await request(
    `query { getViews { id name key objectMetadataId } }`,
  );
  const defaultViews = getViews.filter((view) => view.key === 'INDEX');

  const { objects } = await request(
    `query { objects(paging: { first: 500 }) {
      edges { node { id nameSingular isActive fields(paging: { first: 500 }) { edges { node { id name isActive } } } } }
    } }`,
  );

  const createdAtFieldByObjectId = new Map();
  const objectNameById = new Map();

  for (const { node: object } of objects.edges) {
    objectNameById.set(object.id, object.nameSingular);

    const createdAtField = object.fields.edges
      .map((edge) => edge.node)
      .find((field) => field.name === 'createdAt' && field.isActive);

    if (createdAtField) {
      createdAtFieldByObjectId.set(object.id, createdAtField.id);
    }
  }

  const { getViewSorts } = await request(
    `query { getViewSorts { id viewId fieldMetadataId direction } }`,
  );
  const sortsByViewId = new Map();

  for (const sort of getViewSorts) {
    sortsByViewId.set(sort.viewId, [
      ...(sortsByViewId.get(sort.viewId) ?? []),
      sort,
    ]);
  }

  const toCreate = [];
  const toFix = [];
  const alreadyCorrect = [];
  const skipped = [];

  for (const view of defaultViews) {
    const objectName = objectNameById.get(view.objectMetadataId) ?? '?';
    const createdAtFieldId = createdAtFieldByObjectId.get(
      view.objectMetadataId,
    );

    if (!createdAtFieldId) {
      skipped.push(`${objectName} (no active createdAt field)`);
      continue;
    }

    const existingSorts = sortsByViewId.get(view.id) ?? [];
    const createdAtSort = existingSorts.find(
      (sort) => sort.fieldMetadataId === createdAtFieldId,
    );

    if (createdAtSort) {
      if (createdAtSort.direction === 'DESC') {
        alreadyCorrect.push(objectName);
      } else {
        toFix.push({ objectName, sortId: createdAtSort.id });
      }
      continue;
    }

    // A view already sorting on something else keeps that sort; adding
    // createdAt alongside it would only act as a tiebreaker, which is not
    // what "newest on top" means. Left for a human to decide.
    const otherSort = existingSorts[0];

    if (otherSort) {
      skipped.push(`${objectName} (already sorts on another field)`);
      continue;
    }

    toCreate.push({ objectName, viewId: view.id, createdAtFieldId });
  }

  console.log(`${defaultViews.length} default (INDEX) views`);
  console.log(`  ${toCreate.length} to sort newest-first`);
  console.log(`  ${toFix.length} sorting oldest-first, to flip`);
  console.log(`  ${alreadyCorrect.length} already correct`);

  if (skipped.length > 0) {
    console.log(`  ${skipped.length} skipped:`);
    for (const reason of skipped) {
      console.log(`    - ${reason}`);
    }
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: nothing written.');

    return;
  }

  for (const { objectName, viewId, createdAtFieldId } of toCreate) {
    await request(
      `mutation Create($input: CreateViewSortInput!) {
        createViewSort(input: $input) { id direction }
      }`,
      {
        input: {
          viewId,
          fieldMetadataId: createdAtFieldId,
          direction: 'DESC',
        },
      },
    );
    console.log(`  sorted ${objectName} newest-first`);
  }

  for (const { objectName, sortId } of toFix) {
    await request(
      `mutation Update($input: UpdateViewSortInput!) {
        updateViewSort(input: $input) { id direction }
      }`,
      { input: { id: sortId, update: { direction: 'DESC' } } },
    );
    console.log(`  flipped ${objectName} to newest-first`);
  }

  console.log(
    `\nDone. ${toCreate.length} created, ${toFix.length} flipped.`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
