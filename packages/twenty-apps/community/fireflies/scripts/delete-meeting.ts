import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.TWENTY_API_KEY;
const meetingId = process.argv[2];

async function main() {
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

  const result = await response.json();
  if (result.errors) {
    console.error('❌ Error:', result.errors[0]?.message);
  } else {
    console.log('✅ Deleted meeting:', meetingId);
  }
}

main();
