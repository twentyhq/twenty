import { RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineLogicFunction } from 'twenty-sdk';
import Twenty from 'twenty-sdk/generated';

interface EndRecordingBody {
  callRecordingId: string;
  audioUrl: string;
}

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

  const uploadedFile = await client.uploadFile(
    buffer,
    fileName,
    contentType,
    RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  );

  await client.mutation({
    updateCallRecording: {
      __args: {
        id: callRecording.id,
        data: {
          endedAt: new Date().toISOString(),
          recordingFile: [{ fileId: uploadedFile.id, label: fileName }],
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
