import { definePostInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk/define';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
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
