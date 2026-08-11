require('reflect-metadata');
const { DataSource, EntitySchema } = require('typeorm');

const SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
const COLUMN_COUNT = 60;
const columnNames = Array.from({ length: COLUMN_COUNT }, (_, i) => `field${i}`);

const median = (xs) => {
  const sorted = [...xs].sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)];
};

const time = (label, iterations, fn) => {
  for (let i = 0; i < 200; i++) fn();
  const samples = [];

  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();

    fn();
    samples.push(Number(process.hrtime.bigint() - start) / 1e3);
  }

  console.log(`${label.padEnd(34)} median ${median(samples).toFixed(1)} us/query`);
};

const buildTypeOrm = async () => {
  const columns = {
    id: { name: 'id', type: 'uuid', primary: true },
    deletedAt: { name: 'deletedAt', type: 'timestamptz', deleteDate: true, nullable: true },
  };

  for (const name of columnNames) columns[name] = { name, type: 'text', nullable: true };

  const person = new EntitySchema({ name: 'person', tableName: 'person', schema: SCHEMA, columns });
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    database: 'x',
    username: 'x',
    password: 'x',
    entities: [person],
  });

  await dataSource.buildMetadatas();

  return dataSource;
};

const run = async () => {
  const dataSource = await buildTypeOrm();
  const select = Object.fromEntries(columnNames.map((name) => [name, true]));

  time('typeorm getQueryAndParameters', 2000, () => {
    const qb = dataSource
      .createQueryBuilder('person', 'person')
      .setFindOptions({ select })
      .andWhere(`"person"."field0" ILIKE :p0`, { p0: '%acme%' })
      .orderBy({ 'person.field1': 'ASC' })
      .take(31);

    qb.getQueryAndParameters();
  });

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

  time('kysely compile', 2000, () => {
    db
      .withSchema(SCHEMA)
      .selectFrom('person')
      .select(columnNames.map((name) => sql.ref(name).as(name)))
      .where(sql`"person"."field0" ILIKE ${'%acme%'}`)
      .orderBy(sql.ref('field1'), 'asc')
      .limit(31)
      .compile();
  });

  // What a hand-rolled generator over the flat maps would cost: string building only.
  time('hand-rolled string builder', 2000, () => {
    const projection = columnNames.map((name) => `"person"."${name}"`).join(', ');

    void `SELECT ${projection} FROM "${SCHEMA}"."person" AS "person" WHERE "person"."field0" ILIKE $1 AND "person"."deletedAt" IS NULL ORDER BY "person"."field1" ASC LIMIT 31`;
  });
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
