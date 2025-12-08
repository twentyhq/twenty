/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.TWENTY_API_KEY;
const meetingId = process.argv[2];

const main = async (): Promise<void> => {
  if (!API_KEY) {
    console.error('❌ TWENTY_API_KEY is required');
    process.exit(1);
  }

  if (!meetingId) {
    console.error('Usage: yarn delete:meeting <meetingId>');
    process.exit(1);
  }

  const response = await fetch(`${SERVER_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      query: `mutation DeleteMeeting($id: UUID!) { deleteMeeting(id: $id) { id } }`,
      variables: { id: meetingId },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Delete failed (status ${response.status})`);
    console.error(errorText);
    process.exit(1);
  }

  const result = await response.json();
  const deletedId = result.data?.deleteMeeting?.id;
  if (result.errors || !deletedId) {
    const message = result.errors?.[0]?.message || 'deleteMeeting returned null';
    console.error('❌ Error:', message);
    process.exit(1);
  }

  console.log('✅ Deleted meeting:', deletedId);
};

main().catch((error) => {
  console.error('❌ Failed to delete meeting');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
