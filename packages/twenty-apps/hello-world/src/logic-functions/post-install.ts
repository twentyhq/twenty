import { definePostInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Post install logic function executed successfully!', payload.previousVersion);
};

export default definePostInstallLogicFunction({
  universalIdentifier: 'c1410017-8536-42aa-a188-4bfc5a1c3dae',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 300,
  handler,
});
