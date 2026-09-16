import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/NON_TERMINAL_CALL_RECORDING_STATUSES';
import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/utils/getRecallApiConfig';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/utils/getOwnedDesktopUpload';
import { getString } from 'src/logic-functions/utils/getString';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/utils/isDesktopAudioRecording';
import { updateCallRecording } from 'src/logic-functions/data/utils/updateCallRecording';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/utils/enqueueCallRecordingArtifactsImport';

export const recoverDesktopRecordings = async (
  client: CoreApiClient,
  now: Date,
): Promise<{ recovered: number }> => {
  const config = getRecallApiConfig();
  if (!config.success) return { recovered: 0 };
  const staleBefore = new Date(now.getTime() - 5 * 60_000).toISOString();
  // A small oldest-first batch fits the maintenance function's time budget.
  const result = await client.query({
    callRecordings: {
      __args: {
        first: 5,
        orderBy: [{ updatedAt: 'AscNullsFirst' }],
        filter: {
          and: [
            { companionSession: { is: 'NOT_NULL' } },
            { status: { in: ['JOINING', 'RECORDING', 'PROCESSING'] } },
            {
              updatedAt: {
                lt: staleBefore,
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          createdAt: true,
          companionSession: true,
          status: true,
          transcript: true,
        },
      },
    },
  });
  let recovered = 0;
  for (const { node } of result.callRecordings?.edges ?? []) {
    if (!node || !isDesktopAudioRecording(node.companionSession)) continue;
    if (node.status === 'FAILED') continue;
    const recoverableStatuses = NON_TERMINAL_CALL_RECORDING_STATUSES;
    const session = asRecord(node.companionSession);
    // Rotate the bounded batch so long calls cannot starve completed uploads.
    const claimed = await client.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: String(node.id) },
            updatedAt: { lt: staleBefore },
            status: { in: recoverableStatuses },
          },
          data: { updatedAt: now.toISOString() },
        },
        id: true,
      },
    });
    if (!claimed.updateCallRecordings?.length) continue;
    const sdkUploadId = getString(session?.sdkUploadId);
    if (!sdkUploadId) {
      if (now.getTime() - Date.parse(String(node.createdAt)) > 60 * 60_000)
        await updateCallRecording(client, {
          id: String(node.id),
          expectedStatuses: [CallRecordingStatus.JOINING],
          data: {
            status: CallRecordingStatus.FAILED,
            companionFailureReason: 'desktop_setup_interrupted',
          },
        });
      continue;
    }
    let upload;
    try {
      upload = await getOwnedDesktopUpload({
        id: String(node.id),
        companionSession: node.companionSession,
      });
    } catch {
      // Other records in the batch may still be recoverable during a provider outage.
      continue;
    }
    if (!upload) continue;
    const { status, recording_id: recordingId } = upload;
    if (
      status.code === 'failed' ||
      (status.code === 'pending' &&
        now.getTime() - Date.parse(String(node.createdAt)) > 60 * 60_000)
    ) {
      await updateCallRecording(client, {
        id: String(node.id),
        expectedStatuses:
          status.code === 'pending'
            ? [CallRecordingStatus.JOINING]
            : NON_TERMINAL_CALL_RECORDING_STATUSES,
        data: {
          status: CallRecordingStatus.FAILED,
          companionFailureReason:
            status.sub_code ?? 'desktop_capture_did_not_start',
        },
      });
    } else if (status.code === 'complete' && recordingId) {
      const updated = await updateCallRecording(client, {
        id: String(node.id),
        expectedStatuses: recoverableStatuses,
        data: {
          externalRecordingId: recordingId,
          status: CallRecordingStatus.PROCESSING,
        },
      });
      if (!updated) continue;
      await enqueueCallRecordingArtifactsImport({
        callRecordingId: String(node.id),
      });
      recovered++;
    }
  }
  return { recovered };
};
