import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { getDesktopCompanionAgenda } from 'src/logic-functions/flows/get-desktop-companion-agenda.util';
import {
  createDesktopRecordingUpload,
  failDesktopRecordingCapture,
} from 'src/logic-functions/flows/create-desktop-recording-upload.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';

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

export default defineLogicFunction({
  universalIdentifier: '519aef35-3655-4891-97ea-92fa9f6b3955',
  name: 'desktop-companion',
  description:
    'Authenticated personal agenda and Recall desktop upload provisioning for Twenty Companion.',
  timeoutSeconds: 60,
  handler: desktopCompanionHandler,
  httpRouteTriggerSettings: {
    path: '/call-recorder/desktop',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
