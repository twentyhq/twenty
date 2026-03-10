import { definePostInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Post install logic function executed successfully!', payload.previousVersion);
};

export default definePostInstallLogicFunction({
  universalIdentifier: '7a3f4684-51db-494d-833b-a747a3b90507',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 300,
  handler,
});
