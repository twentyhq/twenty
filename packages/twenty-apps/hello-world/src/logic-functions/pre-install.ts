import { definePreInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Pre install logic function executed successfully!', payload.previousVersion);
};

export default definePreInstallLogicFunction({
  universalIdentifier: 'acaad9a6-236e-44b9-b4f1-4e65bd149d00',
  name: 'pre-install',
  description: 'Runs before installation to prepare the application.',
  timeoutSeconds: 300,
  handler,
});
