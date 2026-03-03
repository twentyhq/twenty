import { definePostInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Post install logic function executed successfully!', payload.previousVersion);
};

export default definePostInstallLogicFunction({
  universalIdentifier: '08292efc-d7ba-4ec3-ab95-e7c33bd3a3bc',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 300,
  handler,
});
