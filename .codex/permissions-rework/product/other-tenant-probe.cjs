const { Client } = require('pg');
const { writeFileSync, readFileSync } = require('node:fs');
const { performance } = require('node:perf_hooks');
const { setTimeout: delay } = require('node:timers/promises');
const connectionString = process.env.PERMISSION_BENCHMARK_DATABASE_URL;
if (
  !connectionString ||
  !new URL(connectionString).pathname.includes('permission') ||
  !new URL(connectionString).pathname.includes('bench')
)
  throw new Error('Dedicated permission benchmark database required');
const reportPath = process.env.PERMISSION_TENANT_PROBE_REPORT;
const rebuildReport = process.env.PERMISSION_BENCHMARK_REPORT;
const durationMilliseconds = Number(
  process.env.PERMISSION_TENANT_PROBE_DURATION_MS ?? 75 * 60 * 1000,
);
if (
  !reportPath ||
  !Number.isFinite(durationMilliseconds) ||
  durationMilliseconds <= 0
)
  throw new Error('A report path and positive duration are required');
(async () => {
  const setup = new Client({
    connectionString,
    application_name: 'permission_other_tenant_setup',
  });
  await setup.connect();
  await setup.query('CREATE SCHEMA IF NOT EXISTS other_tenant_benchmark');
  const existing = (
    await setup.query(
      "SELECT to_regclass('other_tenant_benchmark.company') AS existing",
    )
  ).rows[0].existing;
  if (!existing) {
    await setup.query(
      `CREATE TABLE other_tenant_benchmark.company AS SELECT md5(number::text)::uuid AS id, 'City-' || (number % 10) AS city, number AS position, ARRAY[md5('group-' || (number % 1000))::uuid] AS "readableByAccessGroupIds", repeat('x',256) AS payload FROM generate_series(1,1000000) number`,
    );
    await setup.query(
      'ALTER TABLE other_tenant_benchmark.company ADD PRIMARY KEY(id)',
    );
    await setup.query(
      'CREATE INDEX company_city ON other_tenant_benchmark.company(city,position,id)',
    );
    await setup.query(
      'CREATE INDEX company_access ON other_tenant_benchmark.company USING gin("readableByAccessGroupIds")',
    );
    await setup.query('ANALYZE other_tenant_benchmark.company');
  }
  await setup.end();
  const startedAt = performance.now();
  const samples = [];
  const errorSamples = [];
  let errors = 0;
  let iterations = 0;
  let reading = true;
  const report = () => {
    const sorted = [...samples].sort((a, b) => a - b);
    return {
      rows: 1000000,
      concurrency: 4,
      elapsedSeconds: (performance.now() - startedAt) / 1000,
      queries: samples.length,
      errors,
      errorSamples,
      p50Ms: sorted[Math.floor(sorted.length * 0.5)],
      p99Ms: sorted[Math.floor(sorted.length * 0.99)],
      maximumMs: sorted.at(-1),
      updatedAt: new Date().toISOString(),
    };
  };
  try {
    await Promise.all(
      Array.from({ length: 4 }, (_, index) =>
        (async () => {
          const client = new Client({
            connectionString,
            application_name: 'permission_other_tenant_probe',
            statement_timeout: 250,
          });
          await client.connect();
          try {
            while (reading) {
              const begin = performance.now();
              try {
                await client.query(
                  `SELECT id FROM other_tenant_benchmark.company WHERE city = $1 AND "readableByAccessGroupIds" && ARRAY[md5($2)::uuid] ORDER BY position DESC,id DESC LIMIT 50`,
                  ['City-' + index, 'group-' + index],
                );
                samples.push(performance.now() - begin);
              } catch (error) {
                errors++;
                if (errorSamples.length < 100)
                  errorSamples.push({
                    at: new Date().toISOString(),
                    code: error.code,
                    message: error.message,
                    elapsedMs: performance.now() - begin,
                  });
              }
              if (++iterations % 200 === 0) {
                writeFileSync(reportPath, JSON.stringify(report(), null, 2));
                try {
                  const progress = JSON.parse(readFileSync(rebuildReport));
                  if (progress.finishedAt || progress.error) reading = false;
                } catch {}
              }
              if (performance.now() - startedAt > durationMilliseconds)
                reading = false;
              await delay(40);
            }
          } finally {
            await client.end();
          }
        })(),
      ),
    );
  } finally {
    writeFileSync(
      reportPath,
      JSON.stringify(
        { ...report(), finishedAt: new Date().toISOString() },
        null,
        2,
      ),
    );
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
