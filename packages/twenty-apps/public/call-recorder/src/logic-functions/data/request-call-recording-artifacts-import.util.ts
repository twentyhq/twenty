import { IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH } from 'src/constants/import-call-recording-artifacts-route-path';
import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';

export const requestCallRecordingArtifactsImport = async (
  request: CallRecordingArtifactsImportRequest,
): Promise<boolean> =>
  postToOwnRoute({
    path: IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH,
    body: request,
  });
