/* eslint-disable no-console */
import { createClient } from '@clickhouse/client';
import { config } from 'dotenv';

import { objectEventFixtures, workspaceEventFixtures } from './fixtures';

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
});

async function seedEvents() {
  try {
    console.log(
      `⚡ Seeding ${workspaceEventFixtures.length} workspace events...`,
    );

    await client.insert({
      table: 'workspaceEvent',
      values: workspaceEventFixtures,
      format: 'JSONEachRow',
    });

    console.log(`⚡ Seeding ${objectEventFixtures.length} object events...`);

    await client.insert({
      table: 'objectEvent',
      values: objectEventFixtures,
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
