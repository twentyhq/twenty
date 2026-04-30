import { useEffect, useState } from 'react';
import { SummaryViewer } from 'src/components/SummaryViewer';
import { SummaryViewerSkeleton } from 'src/components/SummaryViewerSkeleton';
import {
  SUMMARIZE_PERSON_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  SUMMARIZE_PERSON_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/summarize-person-recordings-universal-identifiers';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-sdk/clients';
import { isDefined } from 'twenty-shared/utils';

const SUMMARIZATION_SYSTEM_PROMPT = [
  'You are a helpful assistant that summarizes call transcripts.',
  'Provide a concise summary with:',
  '1) A brief overview of the calls',
  '2) Key themes across all calls',
  '3) Action items (if any)',
  '4) Risks or opportunities identified',
  'Use markdown formatting.',
].join(' ');

type Recording = {
  id: string;
  name: string | null;
  createdAt: string;
  summary: { markdown: string | null } | null;
};

const summarizeAllRecordings = async (
  recordings: Recording[],
): Promise<string | undefined> => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    return undefined;
  }

  const summariesText = recordings
    .map(
      (recording, index) =>
        `### ${index + 1}. ${recording.name ?? 'Untitled'} (${
          recording.createdAt
        })\n${recording.summary?.markdown ?? 'No summary available'}`,
    )
    .join('\n\n---\n\n');

  const userPrompt = [
    `Here are the summaries of ${recordings.length} call recording(s) linked to this person:`,
    '',
    summariesText,
    '',
    'Generate a detailed summary of these calls.',
    'Highlight key themes, action items, and any risks or opportunities.',
  ].join('\n');

  const url = `${apiBaseUrl}/rest/ai/generate-text`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      systemPrompt: SUMMARIZATION_SYSTEM_PROMPT,
      userPrompt,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `AI summarization request failed with status ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as { text?: string };

  return data.text ?? undefined;
};

const SummarizePersonRecordings = () => {
  const personRecordId = useRecordId();

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isDefined(personRecordId)) {
      setError(new Error('No person record selected'));
      setLoading(false);

      return;
    }

    const fetchAndSummarize = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = new CoreApiClient();

        const result: Record<string, unknown> = await client.query({
          callRecordings: {
            __args: {
              filter: { personId: { eq: personRecordId } },
            },
            edges: {
              node: {
                id: true,
                name: true,
                summary: { markdown: true },
                createdAt: true,
              },
            },
          },
        });

        const recordings: Recording[] =
          (
            result?.callRecordings as {
              edges?: { node: Recording }[];
            }
          )?.edges?.map((edge) => edge.node) ?? [];

        if (recordings.length === 0) {
          setError(new Error('No call recordings linked to this person'));
          setLoading(false);

          return;
        }

        const generatedSummary = await summarizeAllRecordings(recordings);

        setSummary(generatedSummary ?? null);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError
            : new Error('Failed to summarize recordings'),
        );
      }

      setLoading(false);
    };

    fetchAndSummarize();

    return () => {
      setSummary(null);
      setLoading(false);
      setError(null);
    };
  }, [personRecordId]);

  if (loading) {
    return <SummaryViewerSkeleton />;
  }

  if (isDefined(error)) {
    throw error;
  }

  return <SummaryViewer markdown={summary} />;
};

export default defineFrontComponent({
  universalIdentifier:
    SUMMARIZE_PERSON_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Person Call Recordings',
  description:
    'Generates and displays a summary of recent call recordings for a person',
  component: SummarizePersonRecordings,
  command: {
    universalIdentifier:
      SUMMARIZE_PERSON_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'Summarize call recordings',
    icon: 'IconSparkles',
    isPinned: false,
    availabilityType: 'SINGLE_RECORD',
    availabilityObjectUniversalIdentifier:
      '20202020-e674-48e5-a542-72570eee7213',
  },
});
