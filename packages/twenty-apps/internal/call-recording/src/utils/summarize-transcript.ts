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

  if (!apiBaseUrl || !token) {
    return undefined;
  }

  const response = await fetch(`${apiBaseUrl}/rest/ai/generate-text`, {
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

  if (!response.ok) {
    throw new Error(
      `AI summarization request failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as { text?: string };

  return data.text ?? undefined;
};
