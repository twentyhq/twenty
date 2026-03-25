import {
  RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/call-recording';
import {
  matchParticipants,
  type Participant,
} from 'src/utils/match-participants';
import { summarizeTranscript } from 'src/utils/summarize-transcript';
import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient, MetadataApiClient } from 'twenty-sdk/clients';
import { z } from 'zod';

interface LocalTranscriptWord {
  text: string;
  start_timestamp?: { relative: number; absolute: string };
  end_timestamp?: { relative: number; absolute: string };
}

interface LocalTranscriptEntry {
  participant: { name: string };
  words: LocalTranscriptWord[];
}

interface EndRecordingBody {
  callRecordingId: string;
  audioUrl: string;
  transcriptUrl?: string;
  participants?: Participant[];
  localTranscript?: LocalTranscriptEntry[];
}

type UploadedFileRef = { fileId: string; label: string };

const timestampSchema = z.object({
  relative: z.number(),
  absolute: z.string(),
});

const transcriptEntrySchema = z.object({
  participant: z.object({
    name: z.string().nullable(),
  }),
  words: z.array(
    z.object({
      text: z.string(),
      start_timestamp: timestampSchema.optional(),
      end_timestamp: timestampSchema.optional(),
    }),
  ),
});

const transcriptSchema = z.array(transcriptEntrySchema);

const transcriptToMarkdown = (
  entries: z.infer<typeof transcriptSchema>,
): string =>
  entries
    .map((entry) => {
      const speaker = entry.participant?.name ?? 'Unknown';
      const text = entry.words.map((word) => word.text).join(' ');

      return `**${speaker}:** ${text}`;
    })
    .join('\n\n');

const localTranscriptToMarkdown = (
  entries: LocalTranscriptEntry[],
): string =>
  entries
    .map((entry) => {
      const speaker = entry.participant?.name ?? 'Unknown';
      const text = entry.words.map((word) => word.text).join(' ');

      return `**${speaker}:** ${text}`;
    })
    .join('\n\n');

const downloadFile = async (
  url: string,
): Promise<{ buffer: Buffer; contentType: string; fileName: string }> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? 'audio/mpeg';

  const urlPath = new URL(url).pathname;
  const fileName = urlPath.split('/').pop() ?? 'recording.mp4';

  const arrayBuffer = await response.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
    fileName,
  };
};

const processTranscript = async (
  metadataClient: InstanceType<typeof MetadataApiClient>,
  transcriptUrl: string | undefined,
  localTranscript?: LocalTranscriptEntry[],
): Promise<
  | {
      transcriptFile?: UploadedFileRef[];
      transcript?: { blocknote: null; markdown: string };
    }
  | undefined
> => {
  // The local transcript already has correct speakers (from isActiveSpeaker
  // tracking) and word-level timestamps (from the SDK events). Use it
  // directly instead of the Recall file which misattributes speakers.
  if (localTranscript?.length) {
    const transcriptBuffer = Buffer.from(
      JSON.stringify(localTranscript),
      'utf-8',
    );

    const uploadedTranscript = await metadataClient.uploadFile(
      transcriptBuffer,
      'transcript.json',
      'application/json',
      TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
    );

    return {
      transcriptFile: [
        { fileId: uploadedTranscript.id, label: 'transcript.json' },
      ],
      transcript: {
        blocknote: null,
        markdown: localTranscriptToMarkdown(localTranscript),
      },
    };
  }

  // Fallback: use the Recall-provided transcript file when no local data
  if (!transcriptUrl) {
    return undefined;
  }

  const { buffer, fileName } = await downloadFile(transcriptUrl);

  const uploadedTranscript = await metadataClient.uploadFile(
    buffer,
    fileName,
    'application/json',
    TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  const parsedEntries = transcriptSchema.parse(
    JSON.parse(buffer.toString('utf-8')),
  );

  return {
    transcriptFile: [{ fileId: uploadedTranscript.id, label: fileName }],
    transcript: { blocknote: null, markdown: transcriptToMarkdown(parsedEntries) },
  };
};

const handler = async (event: any) => {
  const body = event.body as EndRecordingBody | null;

  if (!body?.callRecordingId) {
    throw new Error('Missing callRecordingId in request body');
  }

  if (!body?.audioUrl) {
    throw new Error('Missing audioUrl in request body');
  }

  const client = new CoreApiClient();
  const metadataClient = new MetadataApiClient();

  const { callRecording } = await client.query({
    callRecording: {
      __args: {
        filter: { id: { eq: body.callRecordingId } },
      },
      id: true,
      name: true,
      status: true,
    },
  });

  if (!callRecording) {
    throw new Error(`Call recording not found: ${body.callRecordingId}`);
  }

  if (callRecording.status === 'ENDED') {
    throw new Error(`Call recording already ended: ${body.callRecordingId}`);
  }

  const { buffer, contentType, fileName } = await downloadFile(body.audioUrl);

  const uploadedRecording = await metadataClient.uploadFile(
    buffer,
    fileName,
    contentType,
    RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  const transcriptData = await processTranscript(
    metadataClient,
    body.transcriptUrl,
    body.localTranscript,
  );

  const callName = body.participants?.length
    ? `Call ${body.participants
        .map((participant) => participant.name)
        .join(' / ')}`
    : undefined;
  const updateData: Record<string, unknown> = {
    status: 'ENDED',
    endedAt: new Date().toISOString(),
    recordingFile: [{ fileId: uploadedRecording.id, label: fileName }],
    ...transcriptData,
    ...(callName ? { name: callName } : {}),
  };

  delete updateData.createdAt;

  await client.mutation({
    updateCallRecording: {
      __args: {
        id: callRecording.id,
        data: updateData,
      },
      id: true,
      endedAt: true,
      status: true,
    },
  });

  // TODO: remove `as any` after running `yarn twenty dev` to regenerate the typed client
  const updateSummary = async (markdown: string) => {
    await client.mutation({
      updateCallRecording: {
        __args: {
          id: callRecording.id,
          data: {
            summary: { blocknote: null, markdown },
          } as any,
        },
        id: true,
      },
    });
  };

  if (transcriptData?.transcript?.markdown) {
    console.log(
      '[end-recording] Transcript available, attempting summarization...',
    );

    await updateSummary('*Generating summary...*');

    try {
      const summaryMarkdown = await summarizeTranscript(
        transcriptData.transcript.markdown,
      );

      console.log(
        '[end-recording] Summarization result:',
        summaryMarkdown ? `${summaryMarkdown.length} chars` : 'undefined',
      );

      if (summaryMarkdown) {
        await updateSummary(summaryMarkdown);
        console.log('[end-recording] Summary saved to record');
      } else {
        await updateSummary('*Failed to generate summary: NO_RESPONSE*');
      }
    } catch (error) {
      const errorCode =
        error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      console.error('[end-recording] AI summarization failed:', error);
      await updateSummary(`*Failed to generate summary: ${errorCode}*`);
    }
  } else {
    console.log(
      '[end-recording] No transcript markdown, skipping summarization',
    );
  }

  if (body.participants?.length) {
    await matchParticipants(callRecording.id, body.participants);
  }
};

export default defineLogicFunction({
  universalIdentifier: '471353f6-5933-417b-8062-9ad0fc44cd7f',
  name: 'end-recording',
  description: 'Endpoint to end a call recording',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/end-recording',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
