import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/is-desktop-audio-recording.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';
import { getString } from '@twentyhq/recall-utils/utils/get-string.util';

type OwnedDesktopUpload = {
  id: string;
  recording_id: string | null;
  upload_token?: string;
  status: { code: string; sub_code?: string | null };
  metadata: Record<string, unknown>;
};

export const getOwnedDesktopUpload = async (recording: {
  id: string;
  companionSession?: unknown;
}): Promise<OwnedDesktopUpload | undefined> => {
  const session = asRecord(recording.companionSession);
  const uploadId = getString(session?.sdkUploadId);
  const ownerId = getString(session?.userWorkspaceId);
  if (!isDesktopAudioRecording(session) || !uploadId || !ownerId)
    return undefined;
  const workspaceId = getCurrentWorkspaceId();
  const config = getRecallApiConfig();
  if (!workspaceId || !config.success)
    throw new Error('Recall ownership verification is not configured.');
  const result = await recallBotApiRequest<OwnedDesktopUpload>({
    config: config.config,
    path: `/sdk_upload/${encodeURIComponent(uploadId)}/`,
    method: 'GET',
    maxAttempts: 1,
  });
  if (!result.ok)
    throw new Error('Unable to verify the desktop upload with Recall.');
  const metadata = asRecord(result.data.metadata);
  // Provider metadata was written when the upload was created. Editable CRM fields are not proof of ownership.
  if (
    result.data.id !== uploadId ||
    metadata?.twentyWorkspaceId !== workspaceId ||
    metadata?.twentyCallRecordingId !== recording.id ||
    metadata?.twentyUserWorkspaceId !== ownerId
  )
    return undefined;
  return result.data;
};
