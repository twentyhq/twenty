/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import { type ClickHouseClient, createClient } from '@clickhouse/client';
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const clickHouseUrl = () => {
  const url = process.env.CLICKHOUSE_URL;

  if (url) return url;

  throw new Error(
    'CLICKHOUSE_URL environment variable is not set. Please set it to the ClickHouse URL.',
  );
};

async function ensureDatabaseExists() {
  const [url, database] = clickHouseUrl().split(/\/(?=[^/]*$)/);
  const client = createClient({
    url,
  });

  try {
    await client.command({
      query: `CREATE DATABASE IF NOT EXISTS "${database}"`,
    });
  } catch {
    // It may fail due to permissions, but the database already exists
  } finally {
    await client.close();
  }
}

async function ensureMigrationTable(client: ClickHouseClient) {
  await client.command({
    query: `
        CREATE TABLE IF NOT EXISTS _migration (
          filename String,
          applied_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
      ORDER BY filename;
    `,
  });
}

async function hasMigrationBeenRun(
  filename: string,
  client: ClickHouseClient,
): Promise<boolean> {
  const resultSet = await client.query({
    query: `SELECT count() as count FROM _migration WHERE filename = {filename:String}`,
    query_params: { filename },
    format: 'JSON',
  });
  const result = await resultSet.json<{ count: number }>();

  return result.data[0].count > 0;
}

async function recordMigration(filename: string, client: ClickHouseClient) {
  await client.insert({
    table: '_migration',
    values: [{ filename }],
    format: 'JSONEachRow',
  });
}

async function runMigrations() {
  const dir = path.join(__dirname);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql'));

  await ensureDatabaseExists();

  const client = createClient({
    url: clickHouseUrl(),
    clickhouse_settings: {
      allow_experimental_json_type: 1,
    },
  });

  await ensureMigrationTable(client);

  for (const file of files) {
    const alreadyRun = await hasMigrationBeenRun(file, client);

    if (alreadyRun) {
      console.log(`✔︎ Skipping already applied migration: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf8');

    console.log(`⚡ Running ${file}...`);
    await client.command({ query: sql });
    await recordMigration(file, client);
  }

  console.log('✅ All migrations applied.');
  await client.close();
}

runMigrations().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
