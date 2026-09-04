// Standalone probe: how far back does Microsoft Graph still return transcripts
// for a tenant? Run before building on the API path, since expired meetings
// and the transcript expiration policy remove older transcripts.
//
//   MICROSOFT_TENANT_ID=... MICROSOFT_CLIENT_ID=... MICROSOFT_CLIENT_SECRET=... \
//   ORGANIZER_USER_IDS=id1,id2 DAYS=365 yarn probe

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

const readEnv = (name: string): string => {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    throw new Error(`${name} is required`);
  }

  return value.trim();
};

const getAccessToken = async (): Promise<string> => {
  const response = await fetch(
    `https://login.microsoftonline.com/${readEnv('MICROSOFT_TENANT_ID')}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: readEnv('MICROSOFT_CLIENT_ID'),
        client_secret: readEnv('MICROSOFT_CLIENT_SECRET'),
        scope: 'https://graph.microsoft.com/.default',
      }),
    },
  );
  const body = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || body.access_token === undefined) {
    throw new Error(`Token request failed: ${body.error_description ?? response.status}`);
  }

  return body.access_token;
};

type Transcript = { id: string; meetingId: string | null; createdDateTime: string | null };
type Page = { value?: Transcript[]; '@odata.nextLink'?: string; error?: { message?: string; innerError?: { code?: string } } };

const listTranscripts = async (accessToken: string, organizerUserId: string, days: number): Promise<Transcript[]> => {
  const startDateTime = new Date(Date.now() - days * 24 * 60 * 60 * 1_000).toISOString();
  const transcripts = new Map<string, Transcript>();
  let url: string | undefined =
    `${GRAPH_BASE_URL}/users/${organizerUserId}/onlineMeetings/getAllTranscripts(meetingOrganizerUserId='${organizerUserId}',startDateTime=${startDateTime})?$top=50`;

  while (url !== undefined) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const page = (await response.json()) as Page;

    if (!response.ok) {
      throw new Error(`${response.status} ${page.error?.innerError?.code ?? ''} ${page.error?.message ?? ''}`.trim());
    }

    for (const transcript of page.value ?? []) {
      transcripts.set(transcript.id, transcript);
    }

    url = page['@odata.nextLink'];
  }

  return [...transcripts.values()];
};

const main = async (): Promise<void> => {
  const accessToken = await getAccessToken();
  const days = Number(process.env.DAYS ?? '365');

  for (const organizerUserId of readEnv('ORGANIZER_USER_IDS').split(',')) {
    try {
      const transcripts = await listTranscripts(accessToken, organizerUserId.trim(), days);
      const countsByMonth = new Map<string, number>();

      for (const transcript of transcripts) {
        const month = (transcript.createdDateTime ?? 'unknown').slice(0, 7);

        countsByMonth.set(month, (countsByMonth.get(month) ?? 0) + 1);
      }

      console.log(`\n${organizerUserId.trim()}: ${transcripts.length} transcripts in the last ${days} days`);

      for (const [month, count] of [...countsByMonth.entries()].sort()) {
        console.log(`  ${month}  ${count}`);
      }
    } catch (error) {
      console.log(`\n${organizerUserId.trim()}: FAILED ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
