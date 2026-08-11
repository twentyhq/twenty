// Hands each candidate library a hostile identifier in a column position and prints the
// SQL it produces. Workspace object/field names are validated against /^[a-z][a-zA-Z0-9]*$/
// before they ever reach SQL, so this is a defence-in-depth check, not a live threat model.
const HOSTILE = 'name" , (SELECT pg_sleep(10)) AS "x';
const SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const report = (lib, what, out) =>
  console.log(`${lib.padEnd(12)} ${what.padEnd(26)} ${out}`);

const probeKysely = () => {
  const {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
    sql,
  } = require('kysely');

  const db = new Kysely({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (d) => new PostgresIntrospector(d),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });

  const compiled = db
    .withSchema(SCHEMA)
    .selectFrom('person')
    .select([sql.ref(HOSTILE).as('hostile'), 'person.id'])
    .where(sql.ref('person.nameFirstName'), '=', 'x')
    .limit(1)
    .compile();

  report('kysely', 'sql.ref(hostile)', JSON.stringify(compiled.sql));
  report('kysely', 'bound params', JSON.stringify(compiled.parameters));

  const dynamic = db
    .withSchema(SCHEMA)
    .selectFrom('person')
    .select(db.dynamic.ref(HOSTILE))
    .compile();

  report('kysely', 'dynamic.ref(hostile)', JSON.stringify(dynamic.sql));

  const raw = db
    .withSchema(SCHEMA)
    .selectFrom('person')
    .select(sql`${sql.raw(HOSTILE)}`.as('x'))
    .compile();

  report('kysely', 'sql.raw (escape hatch)', JSON.stringify(raw.sql));
};

const probeDrizzle = () => {
  const { pgSchema, text, uuid } = require('drizzle-orm/pg-core');
  const { drizzle } = require('drizzle-orm/node-postgres');
  const { sql } = require('drizzle-orm');

  const schema = pgSchema(SCHEMA);
  const person = schema.table('person', {
    id: uuid('id').primaryKey(),
    hostile: text(HOSTILE),
  });

  const db = drizzle({ client: { query: async () => ({ rows: [] }) } });
  const query = db
    .select({ id: person.id, hostile: person.hostile })
    .from(person)
    .limit(1);

  report('drizzle', 'runtime-built column', JSON.stringify(query.toSQL().sql));
  report('drizzle', 'bound params', JSON.stringify(query.toSQL().params));

  const identifier = db.select({ x: sql`${sql.identifier(HOSTILE)}` }).from(person);

  report('drizzle', 'sql.identifier(hostile)', JSON.stringify(identifier.toSQL().sql));
};

const probePgPromise = () => {
  const pgp = require('pg-promise')();

  report('pg-promise', 'as.name(hostile)', JSON.stringify(pgp.as.name(HOSTILE)));
  report(
    'pg-promise',
    'format $~ identifier, $ value',
    JSON.stringify(
      pgp.as.format('SELECT $1~ FROM $2~.$3~ WHERE "id" = $4', [
        HOSTILE,
        SCHEMA,
        'person',
        'abc',
      ]),
    ),
  );
};

// postgres.js assembles SQL lazily at execution time and does not export its escaper, so
// this is a transcription of it. The probe asserts the transcription still matches the
// shipped source rather than evaluating anything out of node_modules.
const POSTGRES_JS_ESCAPE_SOURCE = `return '"' + str.replace(/"/g, '""').replace(/\\./g, '"."') + '"'`;

const postgresJsEscapeIdentifier = (str) =>
  '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';

const probePostgresJs = () => {
  const path = require('path');
  const fs = require('fs');
  const source = fs.readFileSync(
    path.join(process.cwd(), 'node_modules', 'postgres', 'src', 'types.js'),
    'utf8',
  );

  if (!source.includes(POSTGRES_JS_ESCAPE_SOURCE)) {
    report('postgres.js', 'transcription', 'STALE — escapeIdentifier changed upstream');

    return;
  }

  report(
    'postgres.js',
    'escapeIdentifier(hostile)',
    JSON.stringify(postgresJsEscapeIdentifier(HOSTILE)),
  );
  report(
    'postgres.js',
    'escapeIdentifier("a.b")',
    JSON.stringify(postgresJsEscapeIdentifier('a.b')),
  );
};

const probeDatabases = () => {
  const { escapePostgresIdentifier } = require('@databases/escape-identifier');

  const cases = [
    ['hostile', HOSTILE],
    ['61 chars', 'a'.repeat(61)],
    ['non-ascii', 'nomé'],
  ];

  for (const [label, value] of cases) {
    try {
      report('@databases', label, JSON.stringify(escapePostgresIdentifier(value)));
    } catch (error) {
      report('@databases', label, `threw: ${error.message}`);
    }
  }
};

for (const probe of [probeKysely, probeDrizzle, probePgPromise, probePostgresJs, probeDatabases]) {
  try {
    probe();
  } catch (error) {
    report(probe.name, 'failed', error.message);
  }
}
