/* oxlint-disable no-console */
import { ClickHouseLogLevel, createClient } from '@clickhouse/client';
import { config } from 'dotenv';

// Read before dotenv overrides it, so an explicit NODE_ENV=production from the caller is not masked by .env
const callerNodeEnvironment = process.env.NODE_ENV;

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const ALLOWED_NODE_ENVIRONMENTS = ['development', 'test'];

async function truncateClickHouseTables() {
  const nodeEnvironment = callerNodeEnvironment ?? process.env.NODE_ENV;

  if (
    !nodeEnvironment ||
    !ALLOWED_NODE_ENVIRONMENTS.includes(nodeEnvironment)
  ) {
    console.error(
      `Refusing to truncate ClickHouse tables with NODE_ENV=${nodeEnvironment}, only allowed in development or test.`,
    );
    process.exit(1);
  }

  const clickHouseUrl = process.env.CLICKHOUSE_URL;

  if (!clickHouseUrl) {
    console.log('CLICKHOUSE_URL is not set, skipping ClickHouse truncation.');

    return;
  }

  const client = createClient({
    url: clickHouseUrl,
    log: { level: ClickHouseLogLevel.OFF },
  });

  try {
    const resultSet = await client.query({
      query: `
        SELECT name
        FROM system.tables
        WHERE database = currentDatabase()
          AND name != '_migration'
          AND engine NOT IN ('View', 'MaterializedView')
          AND is_temporary = 0
      `,
      format: 'JSONEachRow',
    });

    const tables = await resultSet.json<{ name: string }>();

    for (const { name } of tables) {
      await client.command({
        query: `TRUNCATE TABLE IF EXISTS \`${name}\``,
      });
      console.log(`Truncated ClickHouse table ${name}`);
    }

    console.log('All ClickHouse tables truncated successfully.');
  } catch (err) {
    console.error('Error during ClickHouse truncation:', err);
  } finally {
    await client.close();
  }
}

void truncateClickHouseTables();
