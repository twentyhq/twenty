/* eslint-disable no-console */
/**
 * Test script for Fireflies webhook against local Twenty instance
 *
 * Usage:
 *   yarn test:webhook
 *   # or
 *   npx tsx scripts/test-webhook.ts
 *
 * Prerequisites:
 *   1. Twenty server running on http://localhost:3000
 *   2. Fireflies app synced: npx twenty-cli app sync
 *   3. Custom fields created: yarn setup:fields
 *   4. API key configured (get from Settings > Developers > API Keys)
 *   5. Environment variables set (copy .env.example to .env and fill values)
 */

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  .env file not found, using environment variables');
}

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const FIREFLIES_WEBHOOK_SECRET = process.env.FIREFLIES_WEBHOOK_SECRET || 'test_secret';
const _FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY || 'test_api_key';

// Test meeting data (simulating Fireflies API response)
const TEST_MEETING_ID = process.env.MEETING_ID || 'test-meeting-local-' + Date.now();
const CLIENT_REFERENCE_ID = process.env.CLIENT_REFERENCE_ID;

const TEST_WEBHOOK_PAYLOAD = {
  meetingId: TEST_MEETING_ID,
  eventType: 'Transcription completed',
  ...(CLIENT_REFERENCE_ID ? { clientReferenceId: CLIENT_REFERENCE_ID } : {}),
};

// Mock Fireflies GraphQL API response
const MOCK_FIREFLIES_RESPONSE = {
  data: {
    meeting: {
      id: TEST_MEETING_ID,
      title: 'Local Test Meeting',
      date: new Date().toISOString(),
      duration: 1800, // 30 minutes
      participants: [
        { email: 'test1@example.com', name: 'Test User One' },
        { email: 'test2@example.com', name: 'Test User Two' },
      ],
      organizer_email: 'organizer@example.com',
      summary: {
        action_items: ['Complete integration testing', 'Review webhook logs'],
        keywords: ['testing', 'integration', 'webhook'],
        overview: 'This is a test meeting to verify the Fireflies webhook integration.',
        gist: 'Quick test summary',
        topics_discussed: ['Webhook testing', 'Integration verification'],
        meeting_type: 'Test',
      },
      analytics: {
        sentiments: {
          positive_pct: 75,
          negative_pct: 5,
          neutral_pct: 20,
        },
      },
      transcript_url: 'https://app.fireflies.ai/transcript/' + TEST_MEETING_ID,
      recording_url: 'https://app.fireflies.ai/recording/' + TEST_MEETING_ID,
      summary_status: 'ready',
    },
  },
};

// Generate HMAC signature
const generateHMACSignature = (body: string, secret: string): string => {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');
  return `sha256=${signature}`;
};

// Mock Fireflies API fetch (currently unused but kept for reference)
// In production, you'd need to mock this at the network level
const _mockFirefliesFetch = async (url: string, options?: RequestInit) => {
  if (url.includes('graphql.fireflies.ai')) {
    // Return mock Fireflies API response
    return new Response(JSON.stringify(MOCK_FIREFLIES_RESPONSE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // For Twenty API calls, use real fetch
  return fetch(url, options);
};

const main = async () => {
  console.log('🧪 Testing Fireflies Webhook Against Local Twenty Instance\n');
  console.log(`📍 Server URL: ${SERVER_URL}`);
  console.log(`🔑 API Key: ${TWENTY_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔐 Webhook Secret: ${FIREFLIES_WEBHOOK_SECRET ? '✅ Configured' : '⚠️  Using test secret'}\n`);

  // Validation
  if (!TWENTY_API_KEY) {
    console.error('❌ Error: TWENTY_API_KEY is required');
    console.error('   Get your API key from: Settings > Developers > API Keys');
    process.exit(1);
  }

  // Prepare webhook payload
  const unsignedBody = JSON.stringify(TEST_WEBHOOK_PAYLOAD);
  const signature = generateHMACSignature(unsignedBody, FIREFLIES_WEBHOOK_SECRET);
  const payloadWithSignature = {
    ...TEST_WEBHOOK_PAYLOAD,
    'x-hub-signature': signature,
  };
  const body = JSON.stringify(payloadWithSignature);

  console.log('📤 Sending webhook payload:');
  console.log(JSON.stringify(payloadWithSignature, null, 2));
  console.log('\nℹ️  Signature is sent both as header (preferred) and in payload as fallback (headers are not passed to serverless functions)\n');
  console.log(`\n🔐 HMAC Signature: ${signature}\n`);

  // Check if server is reachable
  try {
    const healthCheck = await fetch(`${SERVER_URL}/api/health`);
    if (!healthCheck.ok) {
      throw new Error(`Server health check failed: ${healthCheck.status}`);
    }
    console.log('✅ Server is reachable\n');
  } catch {
    console.error(`❌ Cannot reach server at ${SERVER_URL}`);
    console.error('   Make sure Twenty is running: cd twenty && yarn dev');
    process.exit(1);
  }

  // Note: In a real test, we'd intercept fetch calls
  // For now, we'll make a direct request to the webhook endpoint
  // The actual serverless function will call Fireflies API
  // This test validates the endpoint is accessible

  // Webhook endpoint: The route path from manifest is /webhook/fireflies
  // Routes are matched after removing /s/ prefix
  // So /s/webhook/fireflies should match the route /webhook/fireflies
  const webhookUrl = `${SERVER_URL}/s/webhook/fireflies`;
  console.log(`📡 Calling webhook endpoint: ${webhookUrl}\n`);

  try {
    // Note: This will fail because the serverless function needs to call
    // Fireflies API, which we can't easily mock at the endpoint level.
    // In development, you might want to set FIREFLIES_API_KEY to a test value
    // and mock the Fireflies API endpoint separately.

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TWENTY_API_KEY}`,
        'x-hub-signature': signature,
      },
      body: body,
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    console.log('📥 Response Body:');
    console.log(JSON.stringify(responseData, null, 2));

  // Report whether the server appears to have received the header signature
  const debugMessages = Array.isArray((responseData as any)?.debug)
    ? ((responseData as any).debug as string[])
    : [];
  const headerMissing =
    debugMessages.some((msg) => msg.includes('headerKeys=none')) ||
    debugMessages.some((msg) => msg.includes('providedSignature=undefined'));
  const signatureErrors =
    Array.isArray((responseData as any)?.errors) &&
    ((responseData as any).errors as unknown[]).some(
      (err) => typeof err === 'string' && err.toLowerCase().includes('signature'),
    );

  if (headerMissing) {
    console.log(
      '\n⚠️  Server did not report any received headers; it may be using payload fallback for signature verification.',
    );
  } else {
    console.log('\n✅ Server reported headers present (header-based signature should be used).');
  }

  if (signatureErrors) {
    console.log('⚠️  Signature was rejected by the server (check webhook secret / payload).');
  }

    if (response.ok) {
      console.log('\n✅ Webhook test completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Check Twenty CRM for new Meeting/Note records');
      console.log('   2. Verify custom fields are populated');
      console.log('   3. Check server logs for any errors');
    } else {
      console.log('\n⚠️  Webhook returned an error status');
      console.log('   This might be expected if Fireflies API key is not configured');
      console.log('   or if the meeting data fetch fails.');
    }
  } catch (error) {
    console.error('\n❌ Error calling webhook:');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure Twenty server is running');
    console.error('   2. Ensure app is synced: npx twenty-cli app sync');
    console.error('   3. Check API key is valid');
    console.error('   4. Verify webhook endpoint exists');
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

