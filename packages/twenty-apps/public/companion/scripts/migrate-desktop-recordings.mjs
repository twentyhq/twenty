import { readFileSync } from 'node:fs';

const serverUrl = process.env.TWENTY_API_URL;
const tokenPath = process.env.TWENTY_API_KEY_FILE;
if (!serverUrl || !tokenPath) {
  throw new Error(
    'Set TWENTY_API_URL and TWENTY_API_KEY_FILE for the workspace to migrate.',
  );
}
const apiKey = readFileSync(tokenPath, 'utf8').trim();
const apply = process.argv.includes('--apply');

const graphql = async (query, variables = {}) => {
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`Twenty returned HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors?.length)
    throw new Error(result.errors.map(({ message }) => message).join('\n'));
  return result.data;
};

let after;
let count = 0;
do {
  const { callRecordings } = await graphql(
    `
      query ($after: String) {
        callRecordings(
          first: 100
          after: $after
          filter: {
            and: [
              { desktopRecordingSession: { is: NOT_NULL } }
              { companionSession: { is: NULL } }
              { status: { in: [COMPLETED, FAILED] } }
            ]
          }
        ) {
          edges {
            node {
              id
              desktopRecordingSession
              callRecorderFailureReason
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    { after },
  );
  for (const { node } of callRecordings.edges) {
    const session = node.desktopRecordingSession;
    if (
      session?.source !== 'desktop' ||
      session.media !== 'audio' ||
      !session.userWorkspaceId
    )
      continue;
    if (apply) {
      await graphql(
        `
          mutation ($id: UUID!, $data: CallRecordingUpdateInput!) {
            updateCallRecording(id: $id, data: $data) {
              id
              companionSession
            }
          }
        `,
        {
          id: node.id,
          data: {
            companionSession: session,
            companionFailureReason: node.callRecorderFailureReason,
          },
        },
      );
    }
    count++;
    console.log(`${apply ? 'Migrated' : 'Would migrate'} ${node.id}`);
  }
  after = callRecordings.pageInfo.hasNextPage
    ? callRecordings.pageInfo.endCursor
    : undefined;
} while (after);
console.log(
  `${count} recording(s). ${apply ? 'Existing media and legacy metadata preserved.' : 'Dry run; pass --apply to write.'}`,
);
