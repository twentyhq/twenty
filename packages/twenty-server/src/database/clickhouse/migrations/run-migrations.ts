import fs from 'fs';
import path from 'path';

import { createClient } from '@clickhouse/client';
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

console.log('>>>>>>>>>>>>>>', process.env.CLICKHOUSE_URL);
const client = createClient({
  url: process.env.CLICKHOUSE_URL,
});

async function ensureMigrationTable() {
  await client.command({
    query: `
        CREATE TABLE IF NOT EXISTS migrations (
          filename String,
          applied_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
      ORDER BY filename;
    `,
  });
}

async function hasMigrationBeenRun(filename: string): Promise<boolean> {
  const resultSet = await client.query({
    query: `SELECT count() as count FROM migrations WHERE filename = {filename:String}`,
    query_params: { filename },
    format: 'JSON',
  });
  const result = await resultSet.json<{ count: number }>();

  return result.data[0].count > 0;
}

async function recordMigration(filename: string) {
  await client.insert({
    table: 'migrations',
    values: [{ filename }],
    format: 'JSONEachRow',
  });
}

async function runMigrations() {
  const dir = path.join(__dirname);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql'));

  await ensureMigrationTable();

  for (const file of files) {
    const alreadyRun = await hasMigrationBeenRun(file);

    if (alreadyRun) {
      console.log(`✔︎ Skipping already applied migration: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf8');

    console.log(`⚡ Running ${file}...`);
    await client.command({ query: sql });
    await recordMigration(file);
  }

  console.log('✅ All migrations applied');
  await client.close();
}

runMigrations().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
