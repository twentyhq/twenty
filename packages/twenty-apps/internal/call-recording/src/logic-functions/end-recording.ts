import {
  RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/call-recording';
import { defineLogicFunction } from 'twenty-sdk';
import Twenty from 'twenty-sdk/generated';
import { z } from 'zod';

interface EndRecordingBody {
  callRecordingId: string;
  audioUrl: string;
  transcriptUrl?: string;
}

type UploadedFileRef = { fileId: string; label: string };

const transcriptEntrySchema = z.object({
  participant: z.object({
    name: z.string().nullable(),
  }),
  words: z.array(
    z.object({
      text: z.string(),
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

const downloadFile = async (
  url: string,
): Promise<{ buffer: Buffer; contentType: string; fileName: string }> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: ${response.status}`);
  }

  const contentType =
    response.headers.get('content-type') ?? 'audio/mpeg';

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
  client: InstanceType<typeof Twenty>,
  transcriptUrl: string | undefined,
): Promise<{
  transcriptFile?: UploadedFileRef[];
  transcript?: { blocknote: null; markdown: string };
} | undefined> => {
  if (!transcriptUrl) {
    return undefined;
  }

  const { buffer, contentType, fileName } = await downloadFile(transcriptUrl);

  const uploadedTranscript = await client.uploadFile(
    buffer,
    fileName,
    contentType,
    TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  const rawJson = JSON.parse(buffer.toString('utf-8'));
  const entries = transcriptSchema.parse(rawJson);
  const markdown = transcriptToMarkdown(entries);

  return {
    transcriptFile: [{ fileId: uploadedTranscript.id, label: fileName }],
    transcript: { blocknote: null, markdown },
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

  const client = new Twenty();

  const { callRecording } = await client.query({
    callRecording: {
      __args: {
        filter: { id: { eq: body.callRecordingId } },
      },
      id: true,
      name: true,
      endedAt: true,
    },
  });

  if (!callRecording) {
    throw new Error(`Call recording not found: ${body.callRecordingId}`);
  }

  if (callRecording.endedAt) {
    throw new Error(`Call recording already ended: ${body.callRecordingId}`);
  }

  const { buffer, contentType, fileName } = await downloadFile(body.audioUrl);

  const uploadedRecording = await client.uploadFile(
    buffer,
    fileName,
    contentType,
    RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  const transcriptData = await processTranscript(
    client,
    body.transcriptUrl,
  );

  await client.mutation({
    updateCallRecording: {
      __args: {
        id: callRecording.id,
        data: {
          endedAt: new Date().toISOString(),
          recordingFile: [{ fileId: uploadedRecording.id, label: fileName }],
          ...transcriptData,
        },
      },
      id: true,
      endedAt: true,
    },
  });
};

export default defineLogicFunction({
  universalIdentifier: '471353f6-5933-417b-8062-9ad0fc44cd7f',
  name: 'end-recording',
  description: 'Endpoint to end a call recording',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/end-recording',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
