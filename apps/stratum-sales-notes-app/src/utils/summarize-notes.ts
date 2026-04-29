// Summarisation helper for sales notes — typed notes (not call transcripts).
// Mirrors the upstream call-recording app's summarize-transcript util but with
// a prompt suited to first-person rep narrative (no speaker labels).
//
// Calls Twenty's /rest/ai/generate-text endpoint, which forwards to the
// configured AI provider (Anthropic on UAT/prod) and tracks usage.

const SUMMARIZATION_SYSTEM_PROMPT = [
  'You are a helpful assistant that summarises sales-rep call and meeting notes.',
  'The notes are first-person, written by the sales rep just after the conversation.',
  'There are no speaker labels and no timestamps — treat the input as one account, not a dialogue.',
  'Produce a concise structured summary with: Overview, Key Discussion Points, Decisions Made, Action Items, Open Questions.',
  'Keep it to roughly 25% of the input length.',
  'For short notes (<150 words) just produce 2-3 sentences instead of the full structure.',
  'Use markdown.',
  'Do not invent details that are not in the input.',
].join(' ');

export const summarizeNotes = async (
  notesMarkdown: string,
): Promise<string | undefined> => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  // eslint-disable-next-line no-console
  console.log(
    '[summarizeNotes] Starting',
    JSON.stringify({
      hasApiBaseUrl: !!apiBaseUrl,
      hasToken: !!token,
      notesLength: notesMarkdown.length,
    }),
  );

  if (!apiBaseUrl || !token) {
    // eslint-disable-next-line no-console
    console.log('[summarizeNotes] Skipping: missing apiBaseUrl or token');
    return undefined;
  }

  const url = `${apiBaseUrl}/rest/ai/generate-text`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      systemPrompt: SUMMARIZATION_SYSTEM_PROMPT,
      userPrompt: `Summarise these sales-rep notes:\n\n${notesMarkdown}`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    // eslint-disable-next-line no-console
    console.error('[summarizeNotes] Error response body:', errorBody);
    throw new Error(
      `AI summarisation request failed with status ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as { text?: string };

  // eslint-disable-next-line no-console
  console.log(
    '[summarizeNotes] Result text length:',
    data.text?.length ?? 0,
  );

  return data.text ?? undefined;
};
