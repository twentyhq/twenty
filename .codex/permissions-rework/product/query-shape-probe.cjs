const assert = require('node:assert/strict');
const { Client } = require('pg');
const { readFileSync, writeFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');
const { performance } = require('node:perf_hooks');
const { randomUUID } = require('node:crypto');

(async () => {
  const connectionString = process.env.PERMISSION_BENCHMARK_DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.includes('permission') || !new URL(connectionString).pathname.includes('bench')) throw new Error('Use a dedicated permission benchmark database');
  if (process.env.PERMISSION_BENCHMARK_WAIT_REPORT) {
    for (;;) {
      const progress = JSON.parse(readFileSync(process.env.PERMISSION_BENCHMARK_WAIT_REPORT, 'utf8'));
      if (progress.finishedAt) break;
      if (progress.error) throw new Error(progress.error);
      await delay(10000);
    }
  }
  const client = new Client({ connectionString, application_name: 'permission_query_shape_probe', statement_timeout: 250 });
  await client.connect();
  const report = { startedAt: new Date().toISOString(), deadlineMs: 250, cases: [], cacheConditions: process.env.PERMISSION_BENCHMARK_CACHE_LABEL ?? 'Warm PostgreSQL buffers, immediately after rebuild; OS cache not controlled' };
  const output = process.env.PERMISSION_QUERY_SHAPE_REPORT ?? '/tmp/permission-query-shapes.json';
  const save = () => writeFileSync(output, JSON.stringify(report, null, 2));
  try {
    await client.query('SET jit=off');
    const common = (await client.query('SELECT "readableByAccessGroupIds"[1] AS id FROM compiler_benchmark.company WHERE cardinality("readableByAccessGroupIds")=1 LIMIT 1')).rows[0].id;
    const shared = (await client.query('SELECT share."principalId", company.id, company.city, company."readableByAccessGroupIds" FROM compiler_benchmark."recordShare" share JOIN compiler_benchmark.company company ON company.id=share."recordId" WHERE cardinality(company."readableByAccessGroupIds")=2 LIMIT 1')).rows[0];
    const recipient = shared.readableByAccessGroupIds.find(id => id !== common);
    assert.ok(recipient);
    const reference = (await client.query('SELECT company.id, company.city, company.created_at FROM compiler_benchmark."recordShare" share JOIN compiler_benchmark.company company ON company.id=share."recordId" WHERE share."principalId"=$1 ORDER BY company.created_at DESC,company.id DESC', [shared.principalId])).rows;
    assert.equal(reference.length, 50);
    const select = 'SELECT id,city,created_at FROM compiler_benchmark.company WHERE "deletedAt" IS NULL AND "readableByAccessGroupIds" && $1::uuid[]';
    const shapes = [
      { name: 'broad ordered page', sql: select + ' ORDER BY created_at DESC,id DESC LIMIT 50', values: [[common]], expected: 50 },
      { name: 'broad indexed city page', sql: select + ' AND city=$2 ORDER BY created_at DESC,id DESC LIMIT 50', values: [[common], shared.city], expected: 50 },
      { name: 'sparse recipient positive page', sql: select + ' ORDER BY created_at DESC,id DESC LIMIT 50', values: [[recipient]], ids: reference.map(row => row.id) },
      { name: 'sparse recipient positive city page', sql: select + ' AND city=$2 ORDER BY created_at DESC,id DESC LIMIT 50', values: [[recipient], shared.city], ids: reference.filter(row => row.city === shared.city).map(row => row.id) },
      { name: 'zero-overlap access group', sql: select + ' ORDER BY created_at DESC,id DESC LIMIT 50', values: [[randomUUID()]], expected: 0 },
      { name: 'exact broad count', sql: 'SELECT count(*) FROM compiler_benchmark.company WHERE "deletedAt" IS NULL AND "readableByAccessGroupIds" && $1::uuid[]', values: [[common]], samples: 3 },
      { name: 'exact indexed city count', sql: 'SELECT count(*) FROM compiler_benchmark.company WHERE "deletedAt" IS NULL AND "readableByAccessGroupIds" && $1::uuid[] AND city=$2', values: [[common], shared.city], samples: 3 },
      { name: 'hostile unindexed filter with no match', sql: select + " AND business_payload LIKE '%absent-value%' ORDER BY created_at DESC,id DESC LIMIT 50", values: [[common]], samples: 3 },
      { name: 'deep offset', sql: select + ' ORDER BY created_at DESC,id DESC OFFSET 1000000 LIMIT 50', values: [[common]], samples: 3 },
    ];
    for (const shape of shapes) {
      const result = { name: shape.name, sql: shape.sql, samples: 0, errors: [], rowCounts: [], timings: [] };
      report.cases.push(result);
      for (let sample = 0; sample < (shape.samples ?? 100); sample++) {
        const started = performance.now();
        try {
          const rows = (await client.query(shape.sql, shape.values)).rows;
          result.timings.push(performance.now() - started);
          result.rowCounts.push(rows.length);
          if (shape.ids) assert.deepEqual(rows.map(row => row.id), shape.ids);
          if (shape.expected !== undefined) assert.equal(rows.length, shape.expected);
          result.samples++;
        } catch (error) {
          if (error.code !== '57014') throw error;
          result.errors.push({ code: error.code, message: error.message, elapsedMs: performance.now() - started });
        }
      }
      if (result.errors.length === 0) {
        result.plan = (await client.query('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + shape.sql, shape.values)).rows[0]['QUERY PLAN'];
      }
      const sorted = result.timings.slice().sort((a,b) => a-b);
      result.p50Ms = sorted[Math.floor(sorted.length*0.50)];
      result.p95Ms = sorted[Math.floor(sorted.length*0.95)];
      result.p99Ms = sorted[Math.min(sorted.length-1, Math.floor(sorted.length*0.99))];
      result.firstMs = result.timings[0];
      result.rowCounts = [...new Set(result.rowCounts)];
      delete result.timings;
      save();
    }
    const firstPage = (await client.query(select + ' ORDER BY created_at DESC,id DESC LIMIT 25', [[recipient]])).rows;
    const cursor = firstPage.at(-1);
    const secondPage = (await client.query(select + ' AND (created_at,id)<($2,$3) ORDER BY created_at DESC,id DESC LIMIT 25', [[recipient],cursor.created_at,cursor.id])).rows;
    assert.deepEqual([...firstPage,...secondPage].map(row=>row.id), reference.map(row=>row.id));
    report.pagination = 'Two positive cursor pages exactly match all 50 authoritative source grants';
    assert.equal((await client.query('SELECT 42 AS answer')).rows[0].answer,42);
    report.connectionReusableAfterTimeouts = true;
    report.finishedAt = new Date().toISOString();
    save();
    console.log(JSON.stringify({ cases: report.cases.map(({name,samples,errors,p99Ms,rowCounts})=>({name,samples,cancellations:errors.length,p99Ms,rowCounts})),pagination:report.pagination },null,2));
  } finally { await client.end(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
