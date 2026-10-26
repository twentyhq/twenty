const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { Client } = require('pg');

const configuration = { host: 'localhost', port: 5432, user: 'charles', database: 'permissions_rework_bench_20261026', statement_timeout: 2000, query_timeout: 5000 };
const results = [];

async function main() {
  const holder = new Client(configuration);
  const editor = new Client(configuration);
  await holder.connect();
  await editor.connect();
  try {
    const id = (await holder.query('SELECT id FROM permission_write_sidecar LIMIT 1')).rows[0].id;
    for (const table of ['permission_write_record', 'permission_write_sidecar']) {
      await holder.query('BEGIN');
      await editor.query('BEGIN');
      try {
        await editor.query("SET LOCAL lock_timeout = '100ms'");
        await holder.query(`UPDATE ${table} SET readable = array_append(readable, '00000000-0000-0000-0000-000000000005'::uuid) WHERE id = $1`, [id]);
        const started = performance.now();
        try {
          const result = await editor.query("UPDATE permission_write_record SET business_payload = 'contention-probe' WHERE id = $1", [id]);
          results.push({ permissionTable: table, businessUpdateRows: result.rowCount, elapsedMs: performance.now() - started });
        } catch (error) {
          results.push({ permissionTable: table, elapsedMs: performance.now() - started, error: error.code, message: error.message });
        }
      } finally {
        await Promise.allSettled([holder.query('ROLLBACK'), editor.query('ROLLBACK')]);
      }
    }
  } finally {
    await Promise.allSettled([holder.end(), editor.end()]);
  }
  const evidence = { results, limitation: 'A deliberately held row lock demonstrates contention mechanics, not its frequency under representative traffic. All updates rolled back. Run independently of the full rebuild for a clean workload.' };
  fs.writeFileSync(path.join(__dirname, 'on-record-contention-results.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
