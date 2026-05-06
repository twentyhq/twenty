import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { type InstallPayload } from 'twenty-sdk/logic-function';

const handler = async (payload: InstallPayload): Promise<void> => {
  console.log(
    'Post install logic function executed successfully!',
    payload.previousVersion,
  );
};

export default definePostInstallLogicFunction({
  universalIdentifier: '8c726dcc-1709-4eac-aa8b-f99960a9ec1b',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 30,
  handler,
});
