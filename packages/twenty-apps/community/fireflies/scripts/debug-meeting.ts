/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY;
const meetingId = process.argv[2] || '01KBMR1ZYQ34YP8D2KB4B16QPH';

const main = async (): Promise<void> => {
  if (!FIREFLIES_API_KEY) {
    console.error('❌ FIREFLIES_API_KEY is required');
    process.exit(1);
  }

  const query = `
    query GetTranscript($transcriptId: String!) {
      transcript(id: $transcriptId) {
        id
        title
        summary {
          overview
          notes
          gist
          bullet_gist
          short_summary
          short_overview
          outline
          shorthand_bullet
          action_items
          keywords
          topics_discussed
          meeting_type
          transcript_chapters
        }
      }
    }
  `;

  const response = await fetch('https://api.fireflies.ai/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREFLIES_API_KEY}`,
    },
    body: JSON.stringify({ query, variables: { transcriptId: meetingId } }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API request failed with status ${response.status}`);
    console.error(errorText);
    process.exit(1);
  }

  const json = await response.json();
  console.log('=== Fireflies API Response ===\n');
  console.log(JSON.stringify(json, null, 2));

  if (json.data?.transcript?.summary) {
    const s = json.data.transcript.summary;
    console.log('\n=== Summary Fields Status ===');
    console.log('overview:', s.overview ? `✓ (${s.overview.length} chars)` : '✗ empty');
    console.log('notes:', s.notes ? `✓ (${s.notes.length} chars)` : '✗ empty');
    console.log('gist:', s.gist ? `✓ (${s.gist.length} chars)` : '✗ empty');
    console.log('bullet_gist:', s.bullet_gist ? `✓ (${s.bullet_gist.length} chars)` : '✗ empty');
    console.log('outline:', s.outline ? `✓ (${s.outline.length} chars)` : '✗ empty');
    console.log('action_items:', s.action_items?.length || 0, 'items');
    console.log('topics_discussed:', s.topics_discussed?.length || 0, 'topics');
    console.log('keywords:', s.keywords?.length || 0, 'keywords');
  }
};

main().catch((error) => {
  console.error('❌ Failed to fetch meeting');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
