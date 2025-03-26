import { createClient } from '@clickhouse/client';
import { config } from 'dotenv';
import { fixtures } from 'twenty-analytics/tests/fixtures';

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  database: process.env.CLICKHOUSE_DB,
});

async function seedEvents() {
  try {
    console.log(`⚡ Seeding ${fixtures.length} events...`);

    const processedFixtures = fixtures.map((event) => ({
      ...event,
      payload:
        typeof event.payload === 'object'
          ? JSON.stringify(event.payload)
          : event.payload,
    }));

    await client.insert({
      table: 'events',
      values: processedFixtures,
      format: 'JSONEachRow',
    });

    console.log('✅ All events seeded successfully');
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  } finally {
    await client.close();
  }
}

seedEvents().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
