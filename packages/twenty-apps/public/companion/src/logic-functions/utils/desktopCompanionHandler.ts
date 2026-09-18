import { CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';
import { getDesktopCompanionAgenda } from 'src/logic-functions/flows/utils/getDesktopCompanionAgenda';
import { createDesktopRecordingUpload } from 'src/logic-functions/flows/utils/createDesktopRecordingUpload';
import { failDesktopRecordingCapture } from 'src/logic-functions/flows/utils/failDesktopRecordingCapture';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/utils/getRecallApiConfig';
import { asRecord } from 'src/logic-functions/utils/asRecord';

export const desktopCompanionHandler = async (
  payload: RoutePayload<unknown>,
): Promise<object> => {
  if (!payload.userWorkspaceId)
    throw new Error('Sign in with your Twenty account to use the companion.');
  const body = asRecord(payload.body);
  if (!body) throw new Error('Missing companion request.');
  const userClient = new CoreApiClient({ runAs: 'user' });
  switch (body.action) {
    case 'agenda':
      return getDesktopCompanionAgenda(userClient, payload.userWorkspaceId);
    case 'configuration': {
      const config = getRecallApiConfig();
      if (!config.success)
        throw new Error(
          'Recording is not configured for this workspace. Contact your workspace administrator.',
        );
      return { apiUrl: new URL(config.config.baseUrl).origin };
    }
    case 'create-upload':
      return createDesktopRecordingUpload(
        userClient,
        payload.userWorkspaceId,
        body,
      );
    case 'capture-failed':
      return failDesktopRecordingCapture(
        userClient,
        payload.userWorkspaceId,
        body,
      );
    default:
      throw new Error('Unknown companion request.');
  }
};
