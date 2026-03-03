import { definePostInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Post install logic function executed successfully!', payload.previousVersion);
};

export default definePostInstallLogicFunction({
  universalIdentifier: '7962bf37-93d7-40aa-b9f4-6bbb64079e01',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 300,
  handler,
});
