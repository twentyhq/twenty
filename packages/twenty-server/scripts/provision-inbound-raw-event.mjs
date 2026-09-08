#!/usr/bin/env node
// Idempotent provisioning of the `inboundRawEvent` object — the raw intake log.
//
// WHY THIS EXISTS
//
// Every inbound webhook the CRM owns is currently acknowledged with 200 and
// then normalized. A push that fails to normalize, or carries an unrecognised
// `cmd`, is acked and vanishes: no record, nothing to replay, and no way to
// notice. That is the same class of failure as the calls pipeline that was
// severed at one node and silently dropped every call.
//
// So the payload is written down FIRST, before anything interprets it, and the
// outcome is stamped on it afterwards. That gives three things: nothing that
// reached us is lost, a failed batch can be replayed, and reconciliation gets a
// denominator that is independent of whether the CRM's own logic worked.
//
// A custom object rather than a core table on purpose: no schema migration, and
// the workspace schema is already replicated wholesale into BigQuery by dlt, so
// the log arrives in the warehouse with no ingestion work.
//
// Usage:
//   TWENTY_API_URL=https://crm.enso.ro \
//   TWENTY_API_KEY=<workspace api key> \
//   node packages/twenty-server/scripts/provision-inbound-raw-event.mjs
//
//   Add --dry-run to print the plan without writing.
//
// The field NAMES here must match what EnsoInboundRawEventService writes.

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

const OBJECT = {
  nameSingular: 'inboundRawEvent',
  namePlural: 'inboundRawEvents',
  labelSingular: 'Inbound Raw Event',
  labelPlural: 'Inbound Raw Events',
  description:
    'Every inbound webhook payload, written before it is interpreted. Operational log for replay and reconciliation.',
  icon: 'IconInbox',
};

const toOptions = (entries) =>
  entries.map(([value, label, color], index) => ({
    value,
    label,
    color,
    position: index,
  }));

const FIELDS = [
  {
    name: 'channel',
    label: 'Channel',
    type: 'SELECT',
    icon: 'IconRoute',
    description: 'Which intake path this payload arrived on.',
    options: toOptions([
      ['PBX', 'PBX', 'blue'],
      ['ROISTAT', 'Roistat', 'purple'],
      ['CHATWOOT', 'Chatwoot', 'green'],
      ['META_LEADGEN', 'Meta Lead Ads', 'sky'],
      ['FORM', 'Website Form', 'turquoise'],
      ['OTHER', 'Other', 'gray'],
    ]),
  },
  {
    name: 'source',
    label: 'Source',
    type: 'TEXT',
    icon: 'IconTag',
    description:
      'Finer-grained origin within the channel, e.g. moldcell:event, moldcell:history, roistat:webhook_start.',
  },
  {
    name: 'externalId',
    label: 'External ID',
    type: 'TEXT',
    icon: 'IconHash',
    description:
      "The source system's own id — PBX call id, Chatwoot conversation id, Meta leadgen id. This is the join key reconciliation uses.",
  },
  {
    name: 'occurredAt',
    label: 'Occurred At',
    type: 'DATE_TIME',
    icon: 'IconClock',
    description:
      'Event time as reported by the source, when the payload carries one. Compared against creation date to measure intake lag.',
  },
  {
    name: 'payload',
    label: 'Payload',
    type: 'RAW_JSON',
    icon: 'IconCode',
    description: 'The body exactly as received, before any interpretation.',
  },
  {
    name: 'processingStatus',
    label: 'Processing Status',
    type: 'SELECT',
    icon: 'IconCircleDot',
    description:
      'What became of this payload. IGNORED and FAILED are the rows that used to disappear without trace.',
    options: toOptions([
      ['RECEIVED', 'Received', 'gray'],
      ['ENQUEUED', 'Enqueued', 'blue'],
      ['IGNORED', 'Ignored', 'orange'],
      ['FAILED', 'Failed', 'red'],
    ]),
  },
  {
    name: 'processingNote',
    label: 'Processing Note',
    type: 'TEXT',
    icon: 'IconAlertTriangle',
    description:
      'Why a payload was ignored or failed — the reason it would otherwise have vanished with.',
  },
];

const gql = async (query, variables) => {
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

const findObject = async () => {
  const { objects } = await gql(
    `query { objects(paging: { first: 500 }) {
      edges { node { id nameSingular isActive } }
    } }`,
  );

  return objects.edges
    .map((edge) => edge.node)
    .find((node) => node.nameSingular === OBJECT.nameSingular);
};

// Deliberately NOT the nested `fields` connection on `objects`: that connection
// silently truncates, so it reports fields as absent that plainly exist, and
// this script would then try to re-create them on every run. Ask the top-level
// `fields` query for one object instead.
const findFieldNames = async (objectMetadataId) => {
  const { fields } = await gql(
    `query FieldsForObject($objectMetadataId: UUID!) {
      fields(
        paging: { first: 200 }
        filter: { objectMetadataId: { eq: $objectMetadataId } }
      ) {
        edges { node { name } }
      }
    }`,
    { objectMetadataId },
  );

  return new Set(fields.edges.map((edge) => edge.node.name));
};

const main = async () => {
  console.log(`Metadata endpoint: ${METADATA_ENDPOINT}${DRY_RUN ? ' (dry-run)' : ''}`);

  let object = await findObject();

  if (!object) {
    console.log(`Object "${OBJECT.nameSingular}" does not exist — will create.`);

    if (!DRY_RUN) {
      const { createOneObject } = await gql(
        `mutation CreateObject($input: CreateOneObjectInput!) {
          createOneObject(input: $input) { id nameSingular }
        }`,
        { input: { object: OBJECT } },
      );
      console.log(`  created object ${createOneObject.id}`);
      object = await findObject();
    }
  } else {
    console.log(`Object "${OBJECT.nameSingular}" exists (${object.id}).`);
  }

  if (DRY_RUN && !object) {
    console.log(
      `\n--dry-run: would create the object and ${FIELDS.length} field(s):`,
    );
    for (const field of FIELDS) {
      console.log(`  - ${field.name} (${field.type})`);
    }

    return;
  }

  const existing = await findFieldNames(object.id);
  const missing = FIELDS.filter((field) => !existing.has(field.name));

  console.log(
    `${FIELDS.length} expected field(s): ${FIELDS.length - missing.length} present, ${missing.length} to create`,
  );

  if (DRY_RUN) {
    for (const field of missing) {
      console.log(`  would create ${field.name} (${field.type})`);
    }
    console.log('\n--dry-run: nothing written.');

    return;
  }

  for (const field of missing) {
    await gql(
      `mutation CreateOneField($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) { id name }
      }`,
      {
        input: {
          field: {
            objectMetadataId: object.id,
            name: field.name,
            label: field.label,
            type: field.type,
            description: field.description,
            icon: field.icon,
            isNullable: true,
            ...(field.options ? { options: field.options } : {}),
          },
        },
      },
    );
    console.log(`  created ${field.name}`);
  }

  console.log('\nDone.');
  console.log(
    'Next: re-run provision-sales-manager-role.mjs so the role cannot read it,',
  );
  console.log(
    'and add inboundRawEvent to the dlt curated slice if reconciliation needs it sooner than the next full sync.',
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
