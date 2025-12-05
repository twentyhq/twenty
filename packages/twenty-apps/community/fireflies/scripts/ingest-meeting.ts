/* eslint-disable no-console */
/**
 * Fetch a Fireflies meeting by ID and insert it into Twenty using the same path
 * as the webhook handler.
 *
 * Usage:
 *   yarn meeting:ingest <meetingId>
 * Or
 *   MEETING_ID=... yarn meeting:ingest
 *
 * Required env:
 *   FIREFLIES_API_KEY
 *   FIREFLIES_WEBHOOK_SECRET
 *   TWENTY_API_KEY
 *
 * Optional env:
 *   SERVER_URL (defaults to http://localhost:3000)
 *   FIREFLIES_PLAN (free|pro|business|enterprise)
 */

import { createHmac } from 'crypto';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { WebhookHandler } from '../src/webhook-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const args = process.argv.slice(2);
const meetingId = args[0] || process.env.MEETING_ID;

if (!meetingId) {
  console.error('❌ meetingId is required (arg or MEETING_ID env)');
  process.exit(1);
}

const firefliesApiKey = process.env.FIREFLIES_API_KEY || '';
const twentyApiKey = process.env.TWENTY_API_KEY || '';
const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET || '';

if (!firefliesApiKey) {
  console.error('❌ FIREFLIES_API_KEY is required');
  process.exit(1);
}
if (!twentyApiKey) {
  console.error('❌ TWENTY_API_KEY is required');
  process.exit(1);
}
if (!webhookSecret) {
  console.error('❌ FIREFLIES_WEBHOOK_SECRET is required to generate signature');
  process.exit(1);
}

const payload = {
  meetingId,
  eventType: 'Transcription completed',
};

const body = JSON.stringify(payload);
const signature = `sha256=${createHmac('sha256', webhookSecret)
  .update(body, 'utf8')
  .digest('hex')}`;

const main = async (): Promise<void> => {
  console.log(`🚀 Ingesting meeting ${meetingId} via webhook handler`);
  const handler = new WebhookHandler();
  const result = await handler.handle(payload, {
    'x-hub-signature': signature,
    body,
  });

  console.log('✅ Result:');
  console.log(JSON.stringify(result, null, 2));

  if (result.errors && result.errors.length > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error('❌ Failed to ingest meeting');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

