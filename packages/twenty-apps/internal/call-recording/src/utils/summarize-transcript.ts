const SUMMARIZATION_SYSTEM_PROMPT = [
  'You are a helpful assistant that summarizes call transcripts.',
  'Provide a concise summary with:',
  '1) A brief overview of the call',
  '2) Key discussion points',
  '3) Action items (if any)',
  'Use markdown formatting.',
].join(' ');

export const summarizeTranscript = async (
  transcriptMarkdown: string,
): Promise<string | undefined> => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  console.log(
    '[summarizeTranscript] Starting summarization',
    JSON.stringify({
      hasApiBaseUrl: !!apiBaseUrl,
      hasToken: !!token,
      transcriptLength: transcriptMarkdown.length,
    }),
  );

  if (!apiBaseUrl || !token) {
    console.log(
      '[summarizeTranscript] Skipping: missing apiBaseUrl or token',
    );

    return undefined;
  }

  const url = `${apiBaseUrl}/rest/ai/generate-text`;

  console.log('[summarizeTranscript] Calling', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      systemPrompt: SUMMARIZATION_SYSTEM_PROMPT,
      userPrompt: `Summarize this call transcript:\n\n${transcriptMarkdown}`,
    }),
  });

  console.log(
    '[summarizeTranscript] Response status:',
    response.status,
    response.statusText,
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error('[summarizeTranscript] Error response body:', errorBody);
    throw new Error(
      `AI summarization request failed with status ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as { text?: string };

  console.log(
    '[summarizeTranscript] Result text length:',
    data.text?.length ?? 0,
  );

  return data.text ?? undefined;
};
